// Runs before paint (inlined in <head>) so a returning night visitor never sees a white flash.
// Kept out of the "use client" theme module so the server layout gets the plain string.
export const THEME_KEY = "solenne-theme";
export const themeScript = `try{if(localStorage.getItem('${THEME_KEY}')==='night')document.documentElement.dataset.theme='night'}catch(e){}`;
