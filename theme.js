"use client";
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
        background: {
            default: "#000000", // Black background
            paper: "#000000", // Black background
            box: "#000000", // Black background
        },
        text: {
            primary: "#00ff00", // Green text
            secondary: "#00ff00", // Green text
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
                    "& .MuiInputBase-root": {
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
                            borderColor: "#00ff00", // Green border on hover
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#00ff00", // Green border when focused
                        },
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
    },
});

export default theme;
