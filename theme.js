import { createTheme } from "@mui/material/styles";
import "@fontsource/roboto-mono";

// Create a theme with Roboto Mono as the primary font
const theme = createTheme({
    palette: {
        mode: "dark", // Set to dark mode for terminal-like appearance
        primary: {
            main: "#00ff00", // Green text
        },
        secondary: {
            main: "#ff00ff", // Magenta text
        },
        info: {
            main: "#00ff00", // Force info to green
        },
        success: {
            main: "#00ff00", // Force success to green
        },
        warning: {
            main: "#ffff00", // Keep warning yellow
        },
        error: {
            main: "#ff0000", // Keep error red
        },
        background: {
            default: "#000000", // Black background
            paper: "#000000", // Black background
            box: "#000000", // Black background
        },
        text: {
            primary: "#00ff00", // Green text
            secondary: "#00ff00", // Green text
        },
        action: {
            active: "#00ff00",
            hover: "rgba(0, 255, 0, 0.08)",
            selected: "rgba(0, 255, 0, 0.16)",
            disabled: "rgba(0, 255, 0, 0.3)",
            disabledBackground: "rgba(0, 255, 0, 0.12)",
        },
    },
    typography: {
        fontFamily: `"Roboto Mono", monospace`, // Monospace font
        h1: {
            fontFamily: "Roboto Mono",
        },
        h2: {
            fontFamily: "Roboto Mono",
        },
        body1: {
            fontFamily: "Roboto Mono",
        },
        button: {
            fontFamily: "Roboto Mono",
            textTransform: "none",
        },
        caption: {
            fontFamily: "Roboto Mono",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "8px",
                    color: "#00ff00", // Green text
                    borderColor: "#00ff00", // Green border
                    backgroundColor: "#000000", // Black background
                    "&:hover": {
                        backgroundColor: "#00ff00", // Green background on hover
                        color: "#000000", // Black text on hover
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: "#000000", // Black background
                    color: "#00ff00", // Green text
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#000000", // Black background
                    color: "#00ff00", // Green text
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#000000", // Black background
                    color: "#00ff00", // Green text
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    color: "#00ff00", // Green text
                },
                indicator: {
                    backgroundColor: "#00ff00", // Green indicator
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: "#00ff00", // Green text
                    "&.Mui-selected": {
                        color: "#00ff00", // Green text when selected
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiInputBase-input": {
                        color: "#00ff00", // Green text
                    },
                    "& .MuiInputLabel-root": {
                        color: "#00ff00", // Green label
                    },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "#00ff00", // Green border
                        },
                        "&:hover fieldset": {
                            borderColor: "#00cc00", // Darker green on hover
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#00ff00", // Green border when focused
                        },
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#00ff00",
                    "&.Mui-focused": {
                        color: "#00ff00",
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    color: "#00ff00",
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00ff00",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00ff00",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#00ff00",
                    },
                },
                input: {
                    "&:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #000000 inset",
                        WebkitTextFillColor: "#00ff00",
                        caretColor: "#00ff00",
                        borderRadius: "inherit",
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: "#00ff00", // Green color
                    "&.Mui-checked": {
                        color: "#00ff00", // Green color when checked
                    },
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    color: "#00ff00", // Green text
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: "#00ff00",
                    "&.Mui-checked": {
                        color: "#00ff00",
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    backgroundColor: "#000000",
                    color: "#00ff00",
                    border: "1px solid",
                },
                standardError: {
                    borderColor: "#ff0000",
                    color: "#ff0000",
                    "& .MuiAlert-icon": {
                        color: "#ff0000",
                    },
                },
                standardSuccess: {
                    borderColor: "#00ff00",
                    color: "#00ff00",
                    "& .MuiAlert-icon": {
                        color: "#00ff00",
                    },
                },
                standardWarning: {
                    borderColor: "#ffff00",
                    color: "#ffff00",
                    "& .MuiAlert-icon": {
                        color: "#ffff00",
                    },
                },
                standardInfo: {
                    borderColor: "#00ff00",
                    color: "#00ff00",
                    "& .MuiAlert-icon": {
                        color: "#00ff00",
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: "#00ff00",
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    backgroundColor: "#000000",
                    color: "#00ff00",
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    color: "#00ff00",
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: "#00ff00",
                },
                secondary: {
                    color: "#00ff00",
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: "#00ff00",
                },
            },
        },
    },
});

export default theme;
