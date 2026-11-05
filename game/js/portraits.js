// Talking portraits (Gabriel Knight). Same drawings as the scene, cropped and enlarged.
// Pose classes: eyes-open / eyes-closed, mouth-a / mouth-b; Preston also normal-only / blank-only.
import { seg, arcs } from "./gfx.js";
import { tessBust, pennyBust, ethelBust, codyBust, smallBust } from "./figures.js";

export const PORTRAIT = {
  nell: { name: "NELL NULL", chip: "fG", vb: "112 12 96 118", svg: () => `
    <path class="k sG" d="M108,140 C112,104 124,94 140,90 C146,88 150,86 153,86 L160,92 L167,86 C170,86 174,88 180,90 C196,94 208,104 212,140 Z"/>
    <path class="sG" d="M153,86 C156,91 164,91 167,86"/><circle class="sG" cx="180" cy="112" r="6"/><path class="sG" d="M177.5,109.5 L182.5,114.5"/>
    <path class="hl sG" d="M126,104 C130,114 130,126 127,136 M196,104 C192,114 193,126 196,136 M146,96 C150,98 154,98 158,97"/>
    <path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>
    <path class="k sK" d="M139,54 C138,72 149,82 161,82 C174,82 183,72 183,56"/>
    <path class="sK" d="M140,58 C134,57 133,67 140,68"/><path class="hl sK" d="M137,61 C136,63 137,65 139,65"/>
    <path class="k sR" d="M137,62 C133,46 139,35 150,32 C148,24 153,16 161,16 C169,16 174,23 171,32 C181,35 188,44 185,60 C181,50 172,45 163,46 C155,44 146,50 137,62 Z"/>
    <path class="sR" d="M156,23 C158,20 164,20 166,25 M150,37 C154,40 157,43 159,46 M138,61 C135,67 136,74 139,79 M184,61 C187,67 186,74 183,79"/><path class="sA" d="M145,13 L177,28"/><path class="sK" d="M145,13 L142,11.5"/><path class="hl sR" d="M143,44 C148,40 152,40 156,42 M170,40 C175,40 180,44 182,50"/>
    <path class="sR" d="M147,53 C150,51.5 154,51.5 157,52.5 M168,52.5 C171,51.5 175,51.5 178,53"/>
    <g class="eyes-open"><circle class="fW" cx="155" cy="61.5" r="1.7"/><circle class="fW" cx="174.5" cy="61.5" r="1.7"/></g>
    <g class="eyes-closed"><path class="sW" d="M152,61.5 L158,61.5 M171.5,61.5 L177.5,61.5"/></g>
    <rect class="sW" x="146.5" y="56" width="13" height="10" rx="3"/><rect class="sW" x="166" y="56" width="13" height="10" rx="3"/>
    <path class="sW" d="M159.5,60 L166,60 M146.5,59 L141,58"/>
    <path class="hl sK" d="M149,68.5 C151,69.5 154,69.5 156,68.5 M168.5,68.5 C170.5,69.5 173.5,69.5 175.5,68.5"/>
    <path class="sK" d="M168,66 C165,71 168,73 171,72"/>
    ${[[147.5, 71], [150.5, 72.5], [153.5, 71], [171.5, 71], [174.5, 72.5], [177.5, 71], [161, 70.5]].map(([x, y]) => `<circle class="fK" cx="${x}" cy="${y}" r=".6"/>`).join("")}
    <g class="mouth-a"><path class="sK" d="M161,75.5 C165,74 169,74.5 173,76.5"/></g>
    <g class="mouth-b"><path class="k sK" d="M161,75 C165,73.5 170,74 173,76 C171,79.5 164,80 161,75 Z"/></g>` },

  preston: { name: "PRESTON VALU", chip: "fR", vb: "112 10 96 118", svg: () => `
    <path class="k sR" d="M104,140 C106,108 122,95 150,92 L160,106 L170,92 C198,95 214,108 216,140 Z"/>
    <path class="sR" d="M150,92 L156,118 M170,92 L164,118"/><path class="sW" d="M154,94 L160,104 L166,94"/>
    <path class="hl sR" d="M126,108 C130,116 130,126 128,136 M194,108 C190,116 190,126 192,136"/><circle class="hl sR" cx="160" cy="124" r="1.6"/>
    <path class="hl sW" d="M182,104 L192,102 L190,109 Z"/>
    <path class="sK" d="M152,84 L152,92 M168,84 L168,92"/>
    <path class="k sK" d="M132,50 C131,72 145,86 160,86 C175,86 189,72 188,50"/>
    <path class="sK" d="M133,56 C127,55 127,66 133,66 M187,56 C193,55 193,66 187,66"/>
    <path class="k sA" d="M129,56 C124,34 138,19 158,17 C179,15 196,26 193,46 C192,50 190,54 188,56 C184,45 176,41 167,43 C173,36 168,30 159,33 C148,37 139,45 129,56 Z"/>
    <path class="sA" d="M141,30 C151,23 166,21 179,25 M137,42 C143,37 150,34 156,33"/>
    <path class="hl sA" d="M146,26 C156,22 170,22 182,30 M150,22 C160,19 172,20 184,26 M186,34 C188,40 189,46 188,52"/>
    <path class="sK" d="M160,61 C157,68 160,70 163,69"/><path class="hl sK" d="M141,74 C143,76 144,78 144,80 M179,74 C177,76 176,78 176,80"/>
    <g class="normal-only">
      <path class="sA" d="M142,53 C146,49 152,49 157,51 M163,51 C168,49 174,49 178,53"/>
      <g class="eyes-open"><path class="k sW" d="M143,60 C146,56 152,56 156,60 C152,64 147,64 143,60 Z"/><circle class="fB" cx="150.5" cy="60" r="2"/><circle class="fW" cx="151.3" cy="59.2" r=".5"/>
        <path class="k sW" d="M164,60 C168,56 174,56 177,60 C173,64 168,64 164,60 Z"/><circle class="fB" cx="171.5" cy="60" r="2"/><circle class="fW" cx="172.3" cy="59.2" r=".5"/></g>
      <g class="eyes-closed"><path class="sW" d="M143,60 C147,62.5 152,62.5 156,60 M164,60 C168,62.5 173,62.5 177,60"/></g>
      <g class="mouth-a"><path class="k sW" d="M146,72 C152,81 168,81 174,72 C166,75 154,75 146,72 Z"/><path class="hl sW" d="M154,74 L154,77.5 M160,75 L160,79 M166,74 L166,77.5"/></g>
      <g class="mouth-b"><path class="k sW" d="M146,71 C152,85 168,85 174,71 C166,74 154,74 146,71 Z"/><path class="hl sW" d="M148,74 L172,74"/></g>
      <circle class="sW" cx="129.5" cy="62" r="2.5"/><circle class="sW" cx="190.5" cy="62" r="2.5"/>
    </g>
    <g class="blank-only">
      <path class="sA" d="M143,52 L157,52 M163,52 L177,52"/>
      <circle class="k sW" cx="150" cy="60" r="4.2"/><circle class="fW" cx="150" cy="60" r=".9"/><circle class="k sW" cx="170" cy="60" r="4.2"/><circle class="fW" cx="170" cy="60" r=".9"/>
      <g class="mouth-a"><path class="sK" d="M150,75 L170,75"/></g><g class="mouth-b"><path class="k sK" d="M151,73 L169,73 L169,77 L151,77 Z"/></g>
      <circle class="fG" cx="129.5" cy="62" r="3"/><circle class="fG" cx="190.5" cy="62" r="3"/>${arcs(124, 62, -1, "sG")}${arcs(196, 62, 1, "sG")}
      ${[54, 58, 62, 66, 70, 74, 78].map(y => `<path class="hl sG" d="M138,${y} L182,${y}" opacity=".35"/>`).join("")}
    </g>` },

  iris: { name: "THE OLD WOMAN", chip: "fV", vb: "112 8 96 118", svg: () => `
    <path class="k sV" d="M106,140 C108,108 126,95 150,92 L160,104 L170,92 C194,95 212,108 214,140 Z"/>
    <path class="sV" d="M160,104 L160,140"/>${[112, 122, 132].map(y => `<circle class="sV" cx="165" cy="${y}" r="1.6"/>`).join("")}
    <path class="hl sV" d="M126,108 C130,118 130,128 128,138 M194,108 C190,118 190,128 192,138"/>
    ${[150, 155, 160, 165, 170].map((x, i) => `<circle class="sW" cx="${x}" cy="${98 - Math.abs(i - 2) * 1.2}" r="1.7"/>`).join("")}
    <path class="sK" d="M153,84 L153,92 M167,84 L167,92"/>
    <path class="k sK" d="M139,50 C138,71 148,84 160,84 C172,84 182,71 181,50"/>
    <path class="k sW" d="M137,56 C134,37 146,29 160,29 C174,29 186,37 183,56 C178,46 168,42 160,42 C152,42 142,46 137,56 Z"/>
    <circle class="k sW" cx="160" cy="22" r="8"/><path class="sW" d="M154,20 C158,18 162,18 166,20 M150,36 C154,33 158,32 162,32"/>
    <path class="hl sW" d="M144,40 C150,36 156,35 160,35 M170,36 C175,37 179,40 181,44 M155,24 C158,26 162,26 165,24"/>
    <g class="eyes-open"><circle class="fW" cx="151" cy="60" r="1.5"/><circle class="fW" cx="169" cy="60" r="1.5"/></g>
    <g class="eyes-closed"><path class="sW" d="M148,60.5 L154,60.5 M166,60.5 L172,60.5"/></g>
    <path class="k sA" d="M143,57 L157,56 L156,63 L145,64 Z M163,56 L177,57 L175,64 L164,63 Z" fill-opacity="0"/><path class="sA" d="M157,58 L163,58"/>
    <path class="sA dash" d="M143,60 C134,72 136,88 146,96"/>
    <path class="sK" d="M160,63 C157,69 160,71 163,70 M146,70 L149,72.5 M174,70 L171,72.5"/>
    <path class="hl sK" d="M142,66 L145,67 M178,66 L175,67 M152,79 C156,81 164,81 168,79"/>
    <g class="mouth-a"><path class="sK" d="M153,75 C157,77 163,77 167,74"/></g>
    <g class="mouth-b"><path class="k sK" d="M153,74 C157,73 163,73 167,74 C165,78.5 156,78.5 153,74 Z"/></g>` },

  gus: { name: "GUS IAN", chip: "fB", vb: "112 14 96 118", svg: () => `
    <path class="k sV" d="M106,142 C108,104 124,84 140,82 C148,81 154,82 160,84 C166,82 172,81 180,82 C196,84 212,104 214,142 Z"/>
    <path class="sW" d="M148,84 L160,106 L172,84"/><path class="hl sV" d="M151,86 L155,142 M169,86 L165,142 M128,112 C130,122 130,132 128,140 M192,112 C190,122 190,132 192,140"/>
    ${[116, 128].map(y => `<circle class="hl sV" cx="156" cy="${y}" r="1.6"/>`).join("")}
    <path class="sW" d="M142,84 C142,95 178,95 178,84"/><ellipse class="k sW" cx="139" cy="83" rx="5" ry="7"/><ellipse class="k sW" cx="181" cy="83" rx="5" ry="7"/>
    <path class="hl sW" d="M139,78 L139,88 M181,78 L181,88"/>
    <path class="sK" d="M154,76 L154,82 M166,76 L166,82"/>
    <path class="k sK" d="M137,47 C136,66 148,77 160,77 C172,77 184,66 183,47"/>
    <path class="sW" d="M137,50 C134,54 135,60 138,62 M183,50 C186,54 185,60 182,62"/>
    <path class="hl sK" d="M141,58 L144,59 M141,62 L144,62 M179,58 L176,59 M179,62 L176,62"/>
    <path class="k sW" d="M136,50 C133,32 146,21 160,21 C175,21 187,32 184,50 C180,42 172,38 160,39 C150,38 141,42 136,50 Z"/>
    <path class="hl sW" d="M144,28 C147,25 151,26 151,30 M156,24 C159,21 164,22 164,26 M168,25 C172,23 176,26 175,30 M140,38 C143,35 147,37 146,40 M174,35 C177,34 180,37 178,40 M150,31 C153,29 156,30 156,33 M163,30 C166,28 169,29 169,32"/>
    <path class="sW" d="M146,50 L154,49 M166,49 L174,50"/>
    <g class="eyes-open"><circle class="fW" cx="150.5" cy="55" r="1.5"/><circle class="fW" cx="169.5" cy="55" r="1.5"/></g>
    <g class="eyes-closed"><path class="sW" d="M148,55 L153,55 M167,55 L172,55"/></g>
    <path class="sK" d="M160,56 C156,63 159,66 164,64"/>
    <g class="mouth-a"><path class="k sW" d="M144,68 C150,62 157,65 160,67 C163,65 170,62 176,68 C170,72 163,70 160,70 C157,70 150,72 144,68 Z"/></g>
    <g class="mouth-b"><path class="k sK" d="M155,71 C158,70 162,70 165,71 C164,74.5 156,74.5 155,71 Z"/>
      <path class="k sW" d="M144,66 C150,60 157,63 160,65 C163,63 170,60 176,66 C170,70 163,68 160,68 C157,68 150,70 144,66 Z"/></g>` },

  morris: { name: "MORRIS", chip: "fK", vb: "-6 -6 128 116", svg: () => `
    <path class="sK" d="M24,88 C-4,96 -10,62 10,58 C22,56 22,74 12,72"/>
    <circle class="k sW" cx="30" cy="20" r="14"/><circle class="sK" cx="30" cy="21" r="7.5"/>
    <circle class="k sW" cx="72" cy="14" r="14"/><circle class="sK" cx="72" cy="15" r="7.5"/>
    <path class="k sW" d="M28,98 C14,98 12,66 24,52 C18,36 30,18 52,18 C78,16 92,34 88,54 C104,56 112,64 112,70 C108,78 94,80 86,78 C92,92 82,98 72,98 Z"/>
    <path class="hl sW" d="M30,74 C38,80 50,82 60,80 M22,60 L18,58 M24,66 L19,66 M40,88 C48,90 56,90 62,88"/>
    <circle class="fK" cx="111" cy="69" r="3.2"/><path class="sW" d="M100,74 L118,70 M100,77 L118,80 M98,80 L112,88"/>
    <g class="eyes-open"><circle class="k sW" cx="52" cy="44" r="10"/><circle class="k sW" cx="74" cy="42" r="9"/>
      <circle class="fW" cx="55" cy="45" r="3.4"/><circle class="fW" cx="77" cy="43" r="3.2"/></g>
    <g class="eyes-closed"><path class="sW" d="M43,45 C48,49 56,49 61,45 M66,43 C70,46.5 78,46.5 82,43"/></g>
    <g class="mouth-a"><path class="k sW" d="M90,79 L95,79 L95,85 L90,85 Z"/></g>
    <g class="mouth-b"><path class="k sW" d="M86,80 C90,78 100,78 102,81 C100,88 90,90 86,80 Z"/><path class="k sW" d="M90,79 L95,79 L95,83 L90,83 Z"/></g>
    <path class="sW" d="M40,22 L58,20 M44,18 L44,25 M50,17 L50,24 M56,17 L56,23"/><circle class="fG" cx="62" cy="20" r="2.6"/>
    <path class="k sW" d="M26,98 C26,93 40,93 40,98 Z M62,98 C62,93 76,93 76,98 Z"/>` },

  brett: { name: "BRETT (UNDERGRAD)", chip: "fB", vb: "112 14 96 118", svg: () => `
    <path class="k sB" d="M106,142 C108,104 124,86 140,84 C148,83 154,84 160,86 C166,84 172,83 180,84 C196,86 212,104 214,142 Z"/>
    <path class="sB" d="M138,88 C144,102 176,102 182,88"/><path class="hl sB" d="M152,98 L150,118 M168,98 L170,118 M126,120 C130,128 130,136 128,142 M194,120 C190,128 190,136 192,142"/>
    <circle class="sB" cx="150" cy="120" r="1.6"/><circle class="sB" cx="170" cy="120" r="1.6"/>
    <path class="sV" d="M186,90 L174,142"/><path class="hl sV" d="M192,96 L196,142"/>
    <path class="sK" d="M155,80 L155,87 M166,80 L166,87"/>
    <path class="k sK" d="M140,54 C139,72 149,82 161,82 C173,82 182,72 181,56"/>
    <path class="sK" d="M140,58 C134,57 134,67 140,68 M181,58 C187,57 187,67 181,68"/>
    <path class="k sA" d="M137,58 C134,40 146,30 160,30 C174,30 186,40 183,58 C180,50 176,46 170,48 L166,42 L160,49 L154,42 L148,49 C143,48 139,52 137,58 Z"/>
    <path class="hl sA" d="M146,36 C152,33 158,33 162,34 M168,35 C174,36 178,40 180,46"/>
    <path class="sA" d="M146,54 L156,53 M165,53 L175,54"/>
    <g class="eyes-open"><circle class="fW" cx="152" cy="61" r="1.8"/><circle class="fW" cx="170" cy="61" r="1.8"/><circle class="hl sW" cx="152" cy="61" r="3.6"/><circle class="hl sW" cx="170" cy="61" r="3.6"/></g>
    <g class="eyes-closed"><path class="sW" d="M148,61 L156,61 M166,61 L174,61"/></g>
    <path class="sK" d="M161,63 C158,69 161,71 164,70"/><path class="hl sK" d="M146,69 L148,70 M174,69 L172,70"/>
    <g class="mouth-a"><path class="sK" d="M154,75 C158,78 164,78 168,75"/></g>
    <g class="mouth-b"><path class="k sK" d="M154,74 C158,73 164,73 168,74 C166,80 156,80 154,74 Z"/></g>` },

  tess: { name: "DR. TESS LA", chip: "fA", vb: "112 14 96 118", svg: tessBust },
  penny: { name: "PENNY LEDGER", chip: "fB", vb: "112 10 96 118", svg: pennyBust },
  ethel: { name: "ETHEL BORD", chip: "fV", vb: "112 4 96 118", svg: ethelBust },
  cody: { name: "CODY (RA)", chip: "fR", vb: "112 14 96 118", svg: codyBust },
  small: { name: "DET. SGT. SMALL", chip: "fW", vb: "112 14 96 118", svg: smallBust },
};
