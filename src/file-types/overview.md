https://en.wikipedia.org/wiki/Box-drawing_character

┌─┬┐ ╔═╦╗ ╓─╥╖ ╒═╤╕
│ ││ ║ ║║ ║ ║║ │ ││
├─┼┤ ╠═╬╣ ╟─╫╢ ╞═╪╡
└─┴┘ ╚═╩╝ ╙─╨╜ ╘═╧╛

follow: initial & current value, calculated expected
constraint: calculated initial & current value, expected value

```
Item
i_parent <─────────────────┐
                           │
File                       │
*i_00_f_exists ─fix─┐──────│──> on delete: fix all
i_f_is_folder <─────┘      │
*i_f_path_full ──fix───────┤ on expected -> reservation + qualif
i_f_filename ───follow───┐<┘
i_f_qualif <─────────────┤
i_f_extension <──────────┤
i_f_title <──────────────┤<──┐
i_f_time <───────────────┘<┐ │
                           │ │
FileTimed                  │ │
i_ft_parsing_ok ────c─────>┤ │
i_ft_has_timestamp ─c─────>┤ │
i_ft_is_coherent ───c─────>┤ │
i_ft_has_title ────c───────│─┤
                           │ │
FileExif                   │ │
*i_fe_time ────────follow──┘ │
*i_fe_title ───────follow────┘
i_fe_tz
i_fe_orientation\* fix only in picture

FilePicture
FileMovie
FileMovieConvert
i_00_fmc_conversion\* -> fix i_f_time + i_fe_time

FileDelete: File + i_00_f_exists = false
FileHidden: File + fn override
```
