
exports.ellipseLeft = (str, nbr) => {
	if (str.length < nbr) {
		return str.padEnd(nbr, ' ');
	}
	return '...' + str.substr(-nbr + 3);
};
