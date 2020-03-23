
const options = require('../../file-organizer/options.js');
const { dataPath, createFileGeneric } = require('./helpers.js');
const FilePicture = require('../../file-organizer/file-picture.js');

const { tsFromString } = require('../../file-organizer/timestamp.js');

const { resetOptionsForUnitTesting } = require('./run-helper.js');

async function getPict(dPath) {
    return new FilePicture(dataPath(dPath)).loadData();
}

describe('file-picture-test', () => {
    it('should get exif from files', async () => {
        // No exif at all
        expect((await getPict('no_exif.jpg')).exif_timestamp.humanReadable()).toBe('');

        // Picture
        expect((await getPict('20150306_153340 Cable internet dans la rue.jpg')).exif_timestamp.humanReadable()).toBe('2015-03-06 15-33-40');
        expect((await getPict('canon.JPG')).exif_timestamp.humanReadable()).toBe('2018-02-04 13-17-50');
        expect((await getPict('petitAppPhoto.jpg')).exif_timestamp.humanReadable()).toBe('2020-01-19 01-24-02');

        // Adroid files
        expect((await getPict('2019-09-03 12-48/20190903_124722.jpg')).exif_timestamp.humanReadable()).toBe('2019-09-03 12-47-21');
    });

    it('should get exif rotation from files', async () => {
        expect((await getPict('rotated.jpg')).exif_orientation).toBe(270);
        expect((await getPict('rotated-ok.jpg')).exif_orientation).toBe(0);
        expect((await getPict('rotated-bottom-left.jpg')).exif_orientation).toBe(270);
        expect((await getPict('rotated-right-top.jpg')).exif_orientation).toBe(90);

        expect((await getPict('petitAppPhoto.jpg')).exif_orientation).toBe(0);
        expect((await getPict('no_exif.jpg')).exif_orientation).toBe(0);
    });

    it('should get title from files', async () => {
        expect((await getPict('20150306_153340 Cable internet dans la rue.jpg')).exif_title).toBe('User comments');
        expect((await getPict('canon.JPG')).exif_title).toBe('');
        expect((await getPict('petitAppPhoto.jpg')).exif_title).toBe('');

        // Android files
        expect((await getPict('2019-09-03 12-48/20190903_124722.jpg')).exif_title).toBe('');

        expect((await getPict('no_exif.jpg')).exif_title).toBe('');
    });

    it('should write timestamps correctly', async () => {
        const new1 = await createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
        expect(new1.exif_timestamp.humanReadable()).toBe('2015-03-06 15-33-40');

        await new1.exifWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
        expect(new1.exif_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

        await new1.exifWriteTimestamp(tsFromString('2014-05-06'));
        expect(new1.exif_timestamp.humanReadable()).toBe('2014-05-06');

        new1.remove();
    });

    it('should write titles correctly', async () => {
        const new1 = await createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
        expect(new1.exif_title).toBe('User comments');
        await new1.exifWriteTitle('My new title with àn accent');
        expect(new1.exif_title).toBe('My new title with àn accent');
        new1.remove();

        const new2 = await createFileGeneric('canon.JPG');
        expect(new2.exif_title).toBe('');
        await new2.exifWriteTitle('My other title with àn accent');
        expect(new2.exif_title).toBe('My other title with àn accent');
        new2.remove();
    });

    describe('check', () => {
        it('should be problems when no exif is present', async () => {
            const new1 = await getPict('no_exif.jpg');
            await new1.check();
            expect(Array.from(new1.messages.keys())).toContain('TS_NO_TIMESTAMP');
        });

        it('should rotate pictures when necessary', async () => {
            const new1 = await createFileGeneric('rotated-bottom-left.jpg');

            // Set data to go to the target test
            new1.exif_timestamp = tsFromString('2018-01-02');
            new1.exif_timestamp_raw = new1.exif_timestamp.exif();
            new1.calculatedTS = new1.exif_timestamp;
            new1.calculatedTS.title = new1.exif_title;

            expect(new1.exif_orientation).toBe(270);
            await new1.check();
            expect(Array.from(new1.messages.keys())).toContain('PICT_ROTATE');
            expect(new1.exif_orientation).toBe(0);
            new1.remove();
        });

        it('should set title if necessary', async () => {
            const new1 = await createFileGeneric('no_exif.jpg');

            // Set data to go to the target test
            new1.exif_timestamp = tsFromString('2018-01-02');
            new1.exif_timestamp_raw = new1.exif_timestamp.exif();
            new1.calculatedTS = new1.exif_timestamp;

            expect(new1.exif_title).toBe('');
            new1.calculatedTS.title = 'override title';

            await new1.check();
            expect(Array.from(new1.messages.keys())).toContain('EXIF_WRITE_TITLE');
            expect(new1.exif_title).toBe('override title');
            new1.remove();

            resetOptionsForUnitTesting();
        });
    });
});
