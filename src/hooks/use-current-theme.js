import { useTheme } from "next-themes";

export const useCurrentTheme = ()=>{
    const {theme, setTheme} = useTheme();

    if(theme === "dark" || theme === "light"){
        return theme;
    }

    return systemTheme;
}