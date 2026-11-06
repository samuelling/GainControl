// THE CODA: the last screens of the game, after the final act. From the real record, not the story.
// The 1977 letter's suggestion is paraphrased; only its short postscript is quoted.
export async function coda(api) {
  const { bigCard, centered, cchip } = api;
  await bigCard(`${cchip("FROM THE REAL RECORD", 70, 7, "fW")}
    ${centered("IN 1977, A LETTER IN AMERICAN PSYCHOLOGIST", 118, 7, "sW", 1.1)}
    ${centered("DESCRIBED A REAL SECRET SOCIETY OF YOUNG PSYCHOLOGISTS.", 136, 7, "sW", 1.1)}
    ${centered("ITS AUTHOR, CHARLES GROSS, SUGGESTED SOMEONE STUDY ITS ARCHIVES:", 166, 7, "sM", 1.1)}
    ${centered("WHAT ITS MEMBERS WENT ON TO DO ON GRANT", 184, 7, "sM", 1.1)}
    ${centered("COMMITTEES AND EDITORIAL BOARDS.", 202, 7, "sM", 1.1)}
    ${centered("IN THIS GAME, THAT IS NELL'S LAST PIECE OF EVIDENCE.", 236, 7, "sA", 1.1)}
    ${centered("CLICK TO CONTINUE", 300, 4.4, "sM", .8)}`, { hold: 1500, auto: 0 });
  await bigCard(`${centered("HE ADDED A POSTSCRIPT.", 96, 6, "sM", 1)}
    ${centered("I ALMOST FORGOT:", 140, 16, "sW", 1.5)}
    ${centered("THE GAVEL WAS A BRASS PENIS.", 176, 16, "sW", 1.5)}
    ${centered("C. G. GROSS, AMERICAN PSYCHOLOGIST, 1977", 230, 5.6, "sA", .9)}
    ${centered("CLICK TO CONTINUE", 300, 4.4, "sM", .8)}`, { hold: 2500, auto: 0 });
}
