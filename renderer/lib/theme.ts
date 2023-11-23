import {createTheme} from '@mui/material/styles';
import {red} from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: '#0B2447',
        },
        secondary: {
            main: '#19376D',
        },
        error: {
            main: red.A400,
        },
    },
});

export default theme;
