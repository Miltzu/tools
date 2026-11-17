#engine v8

#feature-id    AutoAlignmentPro : Miltzu > Auto Alignment Pro

#feature-info  Automatic star alignment and plate solving.<br/>\
               Detects stars by itself, retries with more sensitive \
               settings and solves astrometry when needed.<br/>\
               <br/>\
               Miltzu 2026

/*
 * AutoAlignmentPro.js  -  v1.4.0
 *
 * Automatic star alignment + plate solving for PixInsight (V8 runtime,
 * PixInsight 1.9.4 Lockhart or later).
 *
 * - Stars are detected and matched automatically (StarAlignment engine).
 * - Automatic retry ladder with progressively more tolerant profiles.
 * - Plate solving of the reference; the solution is inherited by the
 *   registered images.
 * - Works on open images and on file batches.
 * - Solver start values (focal length, pixel size, target) and a solver
 *   mode for blurry images with very large stars.
 * - Dark theme, English / Finnish user interface.
 *
 * 1.4.0  Smarter image selection for open images: size / type columns,
 *        already aligned, minimized and tiny images left unchecked,
 *        choices kept on refresh, name filter, invert, smart select;
 *        best reference searched among the checked images; "by Miltzu".
 *
 * Author: Miltzu
 */

CoreApplication.ensureMinimumVersion( 1, 9, 4 );

#define AAP_TITLE    "Auto Alignment Pro"
#define AAP_VERSION  "1.4.0"
#define AAP_SETTINGS "AutoAlignmentPro/"

// ----------------------------------------------------------------------------
// Localization
// ----------------------------------------------------------------------------

var AAP_LANG = "en";

const AAP_LANGUAGES = [ [ "en", "English" ], [ "fi", "Suomi" ] ];

const AAP_STRINGS = {
   en: {
      subtitle: "Automatic star alignment and plate solving",
      language: "Language",
      grpImages: "IMAGES",
      grpAlign: "ALIGNMENT",
      grpSolve: "PLATE SOLVING",
      grpLog: "LOG",
      modeViews: "Open images",
      modeFiles: "Files (batch)",
      reference: "Reference:",
      refTip: "<p>The image all other images are aligned to.</p>",
      refFileTip: "<p>Reference file. If empty, the first file of the list is used.</p>",
      autoRef: "Pick best automatically",
      autoRefTip: "<p>Selects the open image with the most detected stars as reference.</p>",
      browse: "Browse...",
      colTarget: "Image to align",
      colStatus: "Status",
      colSize: "Size",
      colType: "Type",
      typeMono: "Mono",
      typeColor: "RGB",
      nAligned: "already aligned",
      nIconic: "minimized",
      nSmall: "small image",
      nOtherSize: "different size",
      filter: "Filter:",
      filterTip: "<p>Part of the image name, e.g. <i>Ha</i>, <i>OIII</i> or <i>light</i>. Several with commas: "
               + "<i>Ha, OIII</i>.</p><p>Press Enter or <b>Select matching</b> to check only the matching images.</p>",
      selectMatching: "Select matching",
      invert: "Invert",
      smart: "Smart select",
      smartTip: "<p>Checks the images that look like they should be aligned and leaves out "
              + "already aligned results (name ends with the postfix or <i>_registered</i>), "
              + "minimized windows and small images such as masks or thumbnails.</p>",
      lSmart: "Selected %1 of %2 images.",
      addFiles: "Add files...",
      clear: "Clear",
      refresh: "Refresh list",
      selectAll: "Select all",
      selectNone: "None",
      profile: "Profile:",
      profileAuto: "Automatic (tries all profiles)",
      profileTip: "<p>Automatic starts with the fastest profile and moves on to more "
                + "sensitive ones only for images that failed to align.</p>",
      pFast: "Fast",
      pSensitive: "Sensitive (faint / few stars)",
      pDistortion: "Distortion correction (wide field / different optics)",
      pTriangles: "Triangles (mirrored / different scale)",
      interpolation: "Interpolation:",
      iAuto: "Automatic",
      iBilinear: "Bilinear",
      iNearest: "Nearest neighbor",
      forceDistortion: "Always use distortion correction",
      forceDistortionTip: "<p>Slower, but more accurate for wide field images and images "
                        + "taken with different optics.</p>",
      drizzle: "Drizzle data (.xdrz)",
      outputDir: "Output folder:",
      postfix: "Postfix:",
      solve: "Plate solve:",
      solveNone: "No plate solving",
      solveMissing: "Reference, if solution is missing",
      solveAlways: "Reference, always",
      solveTip: "<p>The astrometric solution of the reference is inherited by the registered "
              + "images, so one solution is enough for the whole batch.</p>",
      solveOutputs: "Also solve registered images if not inherited",
      solveOutputsTip: "<p>Applies to open images.</p>",
      focal: "Focal length:",
      focalTip: "<p>Focal length in mm given to the solver. 0 = read from the image.</p>",
      pixel: "Pixel size:",
      pixelTip: "<p>Pixel size in micrometers given to the solver. 0 = read from the image.</p>",
      object: "Target / RA Dec:",
      objectTip: "<p>Optional. Object name (M31, NGC 7000, Vega) or coordinates. NGC, IC and "
               + "Messier objects are built in; other names are looked up online.</p><p>Coordinates: <i>RA Dec</i> in degrees "
               + "(10.68 41.27) or <i>h m s d m s</i> (00 42 44 +41 16 09).</p>"
               + "<p>Empty = use the coordinates stored in the image.</p>",
      lookup: "Look up",
      lResolving: "Looking up object: %1 ...",
      lResolved: "   %1: RA %2  Dec %3",
      lResolveFailed: "   Could not find '%1'. Enter coordinates instead (RA Dec).",
      lHints: "   Solver hints:%1",
      wNoObject: "Type an object name or coordinates first.",
      blurry: "Blurry image (very large stars)",
      blurryTip: "<p>Starts directly with the star detection settings for badly defocused or "
               + "bloated stars. Without this option those settings are still tried "
               + "automatically if the normal solve fails.</p>",
      sNormal: "Normal",
      sBlurry1: "Blurry stars",
      sBlurry2: "Giant stars (exhaustive)",
      lAttempt: "   Attempt [%1] ...",
      lAttemptFailed: "   [%1] failed: %2",
      lSolveOK: "   OK [%1]",
      lMeta: "   Start: RA %1  Dec %2  focal %3 mm  pixel %4 um  scale %5 arcsec/px",
      lNoSolver: "   ERROR: the ImageSolver library is not available in this PixInsight installation.",
      lLookupServer: "   %1: %2",
      lNoScale: "   Image scale unknown: enter focal length and pixel size.",
      lNoCoords: "   No usable start coordinates: give the target or coordinates in the Target field.",
      btnSolveOnly: "Plate solve only",
      btnSolveOnlyTip: "<p>Solves the reference and the checked open images without aligning.</p>",
      btnAlign: "Align",
      btnWorking: "Working...",
      btnClose: "Close",
      ready: "Ready",
      stSolved: "solved",
      stWorking: "working...",
      stOK: "OK",
      stFailed: "failed",
      dlgRef: "Select reference image",
      dlgTargets: "Select images to align",
      dlgOutput: "Select output folder",
      wTwoImages: "Open at least two images.",
      wRefFile: "Select a reference file.",
      wOneFile: "Add at least one file to align.",
      wOutputDir: "Select an output folder.",
      wRefView: "Select a reference image.",
      wOneView: "Check at least one image to align.",
      wNoViews: "No images selected.",
      lSolve: "Plate solving: %1 ...",
      lSolveOKProcess: "   OK (ImageSolver process).",
      lSolveOKScript: "   OK (ImageSolver script).",
      lSolverMissing: "   ERROR: ImageSolver.js not found: %1",
      lSolveFailed1: "   Plate solving failed. Check that the image has focal length,",
      lSolveFailed2: "   pixel size and approximate coordinates (FITS headers).",
      lRefSolved: "Reference already has an astrometric solution, skipping plate solve.",
      lStars: "   %1: %2 stars",
      lDetectFailed: "   %1: star detection failed (%2)",
      lAborted: "Aborted.",
      lAligning: "Aligning: %1",
      lNotWith: "   Did not succeed with profile: %1",
      lRefOpenFailed: "Could not open the reference: %1",
      lRefSaved: "Solved reference saved: %1",
      lProfilePass: "Profile [%1]: %2 file(s) ...",
      lPairs: "  (%1 star pairs, RMS %2 px)",
      lDone: "Done: %1 aligned, %2 failed. Time: %3",
      lFailedItem: "   FAILED: %1",
      lFindBest: "Looking for the best reference (most stars) ...",
      lReference: "Reference: %1",
      lError: "ERROR: %1",
      lSolveDone: "Plate solving finished: %1 / %2 solved.",
      sumDone: "Done  -  %1 aligned  -  %2 failed  -  %3",
      sumSolve: "Plate solving finished  -  %1 / %2 solved",
      progress: "%1 / %2"
   },

   fi: {
      subtitle: "Automaattinen tähtikohdistus ja platesolve",
      language: "Kieli",
      grpImages: "KUVAT",
      grpAlign: "KOHDISTUS",
      grpSolve: "PLATESOLVE",
      grpLog: "LOKI",
      modeViews: "Avoimet kuvat",
      modeFiles: "Tiedostot (erä)",
      reference: "Referenssi:",
      refTip: "<p>Kuva, johon muut kohdistetaan.</p>",
      refFileTip: "<p>Referenssitiedosto. Jos tyhjä, käytetään listan ensimmäistä tiedostoa.</p>",
      autoRef: "Paras automaattisesti",
      autoRefTip: "<p>Valitsee referenssiksi avoimen kuvan, josta löytyy eniten tähtiä.</p>",
      browse: "Selaa...",
      colTarget: "Kohdistettava kuva",
      colStatus: "Tila",
      colSize: "Koko",
      colType: "Tyyppi",
      typeMono: "Mono",
      typeColor: "RGB",
      nAligned: "jo kohdistettu",
      nIconic: "pienennetty",
      nSmall: "pieni kuva",
      nOtherSize: "eri koko",
      filter: "Suodatin:",
      filterTip: "<p>Osa kuvan nimestä, esim. <i>Ha</i>, <i>OIII</i> tai <i>light</i>. Useampi pilkulla: "
               + "<i>Ha, OIII</i>.</p><p>Enter tai <b>Valitse osuvat</b> valitsee vain nimeen osuvat kuvat.</p>",
      selectMatching: "Valitse osuvat",
      invert: "Käännä",
      smart: "Älykäs valinta",
      smartTip: "<p>Valitsee kuvat, jotka näyttävät kohdistettavilta, ja jättää pois jo kohdistetut "
              + "tulokset (nimen lopussa pääte tai <i>_registered</i>), pienennetyt ikkunat ja pienet "
              + "kuvat kuten maskit ja esikatselut.</p>",
      lSmart: "Valittu %1 / %2 kuvaa.",
      addFiles: "Lisää tiedostoja...",
      clear: "Tyhjennä",
      refresh: "Päivitä lista",
      selectAll: "Valitse kaikki",
      selectNone: "Ei mitään",
      profile: "Profiili:",
      profileAuto: "Automaattinen (yrittää kaikki profiilit)",
      profileTip: "<p>Automaattinen aloittaa nopeimmalla profiililla ja siirtyy herkempiin "
                + "vain niille kuville, jotka eivät kohdistuneet.</p>",
      pFast: "Nopea",
      pSensitive: "Herkkä (himmeät / vähän tähtiä)",
      pDistortion: "Vääristymäkorjaus (laajakulma / eri optiikka)",
      pTriangles: "Kolmiot (peilattu / eri skaala)",
      interpolation: "Interpolointi:",
      iAuto: "Automaattinen",
      iBilinear: "Bilineaarinen",
      iNearest: "Lähin naapuri",
      forceDistortion: "Vääristymäkorjaus aina päällä",
      forceDistortionTip: "<p>Hitaampi, mutta tarkempi laajakulmakuville ja eri optiikalla "
                        + "otetuille kuville.</p>",
      drizzle: "Drizzle-data (.xdrz)",
      outputDir: "Tulostuskansio:",
      postfix: "Pääte:",
      solve: "Platesolve:",
      solveNone: "Ei platesolvea",
      solveMissing: "Referenssi, jos ratkaisu puuttuu",
      solveAlways: "Referenssi aina uudelleen",
      solveTip: "<p>Referenssin astrometrinen ratkaisu periytyy kohdistetuille kuville, "
              + "joten yksi ratkaisu riittää koko erälle.</p>",
      solveOutputs: "Ratkaise myös kohdistetut, jos ratkaisu ei periytynyt",
      solveOutputsTip: "<p>Koskee avoimia kuvia.</p>",
      focal: "Polttoväli:",
      focalTip: "<p>Solverille annettava polttoväli millimetreinä. 0 = luetaan kuvasta.</p>",
      pixel: "Pikselikoko:",
      pixelTip: "<p>Solverille annettava pikselikoko mikrometreinä. 0 = luetaan kuvasta.</p>",
      object: "Kohde / RA Dec:",
      objectTip: "<p>Valinnainen. Kohteen nimi (M31, NGC 7000, Vega) tai koordinaatit. NGC-, IC- ja "
               + "Messier-kohteet ovat sisäänrakennettuja; muut nimet haetaan verkosta.</p><p>Koordinaatit: <i>RA Dec</i> asteina "
               + "(10.68 41.27) tai <i>h m s d m s</i> (00 42 44 +41 16 09).</p>"
               + "<p>Tyhjä = käytetään kuvaan tallennettuja koordinaatteja.</p>",
      lookup: "Hae",
      lResolving: "Haetaan kohdetta: %1 ...",
      lResolved: "   %1: RA %2  Dec %3",
      lResolveFailed: "   Kohdetta '%1' ei löytynyt. Anna koordinaatit (RA Dec).",
      lHints: "   Solverin vihjeet:%1",
      wNoObject: "Kirjoita ensin kohteen nimi tai koordinaatit.",
      blurry: "Sumea kuva (erittäin suuret tähdet)",
      blurryTip: "<p>Aloittaa suoraan pahasti epätarkkojen tai paisuneiden tähtien "
               + "tunnistusasetuksilla. Ilman tätäkin ne kokeillaan automaattisesti, "
               + "jos tavallinen ratkaisu epäonnistuu.</p>",
      sNormal: "Normaali",
      sBlurry1: "Sumeat tähdet",
      sBlurry2: "Jättitähdet (perusteellinen)",
      lAttempt: "   Yritys [%1] ...",
      lAttemptFailed: "   [%1] epäonnistui: %2",
      lSolveOK: "   OK [%1]",
      lMeta: "   Lähtö: RA %1  Dec %2  polttoväli %3 mm  pikseli %4 um  skaala %5 arcsec/px",
      lNoSolver: "   VIRHE: ImageSolver-kirjasto ei ole käytettävissä tässä PixInsight-asennuksessa.",
      lLookupServer: "   %1: %2",
      lNoScale: "   Kuvan skaala ei ole tiedossa: anna polttoväli ja pikselikoko.",
      lNoCoords: "   Ei käyttökelpoisia lähtökoordinaatteja: anna kohde tai koordinaatit Kohde-kenttään.",
      btnSolveOnly: "Vain platesolve",
      btnSolveOnlyTip: "<p>Ratkaisee referenssin ja valitut avoimet kuvat ilman kohdistusta.</p>",
      btnAlign: "Kohdista",
      btnWorking: "Työskentelee...",
      btnClose: "Sulje",
      ready: "Valmiina",
      stSolved: "ratkaistu",
      stWorking: "työn alla...",
      stOK: "OK",
      stFailed: "epäonnistui",
      dlgRef: "Valitse referenssikuva",
      dlgTargets: "Valitse kohdistettavat kuvat",
      dlgOutput: "Valitse tulostuskansio",
      wTwoImages: "Avaa vähintään kaksi kuvaa.",
      wRefFile: "Valitse referenssitiedosto.",
      wOneFile: "Lisää vähintään yksi kohdistettava tiedosto.",
      wOutputDir: "Valitse tulostuskansio.",
      wRefView: "Valitse referenssikuva.",
      wOneView: "Valitse vähintään yksi kohdistettava kuva.",
      wNoViews: "Ei valittuja kuvia.",
      lSolve: "Platesolve: %1 ...",
      lSolveOKProcess: "   OK (ImageSolver-prosessi).",
      lSolveOKScript: "   OK (ImageSolver-skripti).",
      lSolverMissing: "   VIRHE: ImageSolver.js ei löydy: %1",
      lSolveFailed1: "   Platesolve epäonnistui. Tarkista, että kuvassa on polttoväli,",
      lSolveFailed2: "   pikselikoko ja likimääräiset koordinaatit (FITS-otsakkeet).",
      lRefSolved: "Referenssillä on jo astrometrinen ratkaisu, ohitetaan platesolve.",
      lStars: "   %1: %2 tähteä",
      lDetectFailed: "   %1: tähtientunnistus epäonnistui (%2)",
      lAborted: "Keskeytetty.",
      lAligning: "Kohdistetaan: %1",
      lNotWith: "   Ei onnistunut profiililla: %1",
      lRefOpenFailed: "Referenssin avaus epäonnistui: %1",
      lRefSaved: "Ratkaistu referenssi tallennettu: %1",
      lProfilePass: "Profiili [%1]: %2 tiedostoa ...",
      lPairs: "  (%1 tähtiparia, RMS %2 px)",
      lDone: "Valmis: %1 kohdistettu, %2 epäonnistui. Aika: %3",
      lFailedItem: "   EPÄONNISTUI: %1",
      lFindBest: "Etsitään paras referenssi (eniten tähtiä) ...",
      lReference: "Referenssi: %1",
      lError: "VIRHE: %1",
      lSolveDone: "Platesolve valmis: %1 / %2 ratkaistu.",
      sumDone: "Valmis  -  %1 kohdistettu  -  %2 epäonnistui  -  %3",
      sumSolve: "Platesolve valmis  -  %1 / %2 ratkaistu",
      progress: "%1 / %2"
   }
};

// Returns the localized string for key, replacing %1, %2, ... with arguments.
function aapTr( key, ...args )
{
   let table = AAP_STRINGS[AAP_LANG] || AAP_STRINGS.en;
   let s = table[key];
   if ( s === undefined )
      s = AAP_STRINGS.en[key];
   if ( s === undefined )
      s = key;
   for ( let i = 0; i < args.length; ++i )
      s = s.split( "%" + ( i + 1 ) ).join( String( args[i] ) );
   return s;
}

// ----------------------------------------------------------------------------
// Alignment profiles. In automatic mode they are tried in order until the
// alignment succeeds.
// ----------------------------------------------------------------------------

const AAP_PROFILES = [
   {
      key: "pFast",
      params: {
         sensitivity: 0.5,
         distortionCorrection: false
      }
   },
   {
      key: "pSensitive",
      params: {
         sensitivity: 0.85,
         structureLayers: 6,
         noiseReductionFilterRadius: 2,
         hotPixelFilterRadius: 1,
         maxStarDistortion: 0.8,
         allowClustered: true,
         ransacTolerance: 4.0,
         ransacMaxIterations: 4000
      }
   },
   {
      key: "pDistortion",
      params: {
         sensitivity: 0.7,
         noiseReductionFilterRadius: 2,
         distortionCorrection: true,
         localDistortion: true,
         useSurfaceSplines: true,
         ransacTolerance: 6.0,
         ransacMaxIterations: 4000
      }
   },
   {
      key: "pTriangles",
      params: {
         sensitivity: 0.85,
         noiseReductionFilterRadius: 3,
         useTriangles: true,
         descriptorsPerStar: 40,
         useScaleDifferences: false,
         allowClustered: true,
         ransacTolerance: 6.0,
         ransacMaxIterations: 6000
      }
   }
];

// [ label or string key, StarAlignment constant ]
const AAP_INTERPOLATIONS = [
   [ "iAuto",          "Auto" ],
   [ "Lanczos-3",      "Lanczos3" ],
   [ "Bicubic spline", "BicubicSpline" ],
   [ "iBilinear",      "Bilinear" ],
   [ "iNearest",       "NearestNeighbor" ]
];

// Plate solving attempts: star detection settings given to ImageSolver.
// The blurry ones follow the usual advice for bloated stars: more detection
// scales, larger minimum structure, noise reduction, tolerance for flat and
// distorted star profiles.
const AAP_SOLVE_ATTEMPTS = [
   {
      key: "sNormal",
      blurry: false,
      cfg: {}
   },
   {
      key: "sBlurry1",
      blurry: true,
      cfg: {
         structureLayers: 6,
         minStructureSize: 2,
         noiseReductionFilterRadius: 2,
         hotPixelFilterRadius: 1,
         sensitivity: 0.7,
         peakResponse: 0.8,
         maxStarDistortion: 0.4,
         autoPSF: false,
         restrictToHQStars: false
      }
   },
   {
      key: "sBlurry2",
      blurry: true,
      cfg: {
         structureLayers: 8,
         minStructureSize: 4,
         noiseReductionFilterRadius: 3,
         hotPixelFilterRadius: 1,
         sensitivity: 0.85,
         peakResponse: 0.95,
         maxStarDistortion: 0.25,
         autoPSF: false,
         restrictToHQStars: false,
         tryExhaustiveInitialAlignment: true
      }
   }
];

// Colors (0xAARRGGBB) of the status column.
const AAP_COL_STATUS    = 3;          // status column of the image list
const AAP_COLOR_OK      = 0xff5fd38a;
const AAP_COLOR_FAILED  = 0xffff6b6b;
const AAP_COLOR_WORKING = 0xffffc857;
const AAP_COLOR_INFO    = 0xff7d8696;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

// Sets a process parameter only if it exists in this PixInsight version.
function aapTrySet( P, name, value )
{
   try
   {
      P[name] = value;
      return true;
   }
   catch ( e )
   {
      return false;
   }
}

function aapNormPath( p )
{
   return String( p ).replace( /\\/g, "/" ).toLowerCase();
}

function aapReadSetting( key, type, defaultValue )
{
   try
   {
      let v = Settings.read( AAP_SETTINGS + key, type );
      if ( Settings.lastReadOK && v !== null && v !== undefined )
         return v;
   }
   catch ( e )
   {
   }
   return defaultValue;
}

function aapWriteSetting( key, type, value )
{
   try
   {
      Settings.write( AAP_SETTINGS + key, type, value );
   }
   catch ( e )
   {
   }
}

function aapHasSolution( window )
{
   try
   {
      if ( window == null || window.isNull )
         return false;
   }
   catch ( e )
   {
      return false;
   }
   try
   {
      if ( window.hasAstrometricSolution == true )
         return true;
   }
   catch ( e )
   {
   }
   try
   {
      return window.astrometricSolutionSummary().length > 0;
   }
   catch ( e )
   {
      return false;
   }
}

// Text of a thrown value, whatever its type.
function aapErrorText( e )
{
   if ( e === null || e === undefined )
      return "unknown error";
   if ( e.message !== undefined && e.message !== null && String( e.message ).length > 0 )
      return String( e.message );
   return String( e );
}

// Parses a number typed by the user; accepts a decimal comma. Returns 0 if invalid.
function aapParseNumber( text )
{
   let v = parseFloat( String( text ).replace( ",", "." ) );
   return ( isFinite( v ) && v > 0 ) ? v : 0;
}

// Formats an angle as sexagesimal text: units, minutes and seconds.
function aapSexagesimal( value, withSign )
{
   let sign = ( value < 0 ) ? "-" : ( withSign ? "+" : "" );
   let a = Math.abs( value );
   let d = Math.floor( a );
   let m = Math.floor( ( a - d )*60 );
   let sec = ( ( a - d )*60 - m )*60;
   if ( sec >= 59.95 )
   {
      sec = 0;
      if ( ++m >= 60 )
      {
         m = 0;
         ++d;
      }
   }
   let two = n => ( n < 10 ? "0" : "" ) + n;
   return sign + two( d ) + " " + two( m ) + " " + ( sec < 10 ? "0" : "" ) + sec.toFixed( 1 );
}

// Parses coordinates typed by the user. Returns { ra, dec } in degrees, or
// null if the text is not a pair of coordinates (for example an object name).
//    2 numbers: RA and Dec in degrees
//    4 numbers: RA h m, Dec d m
//    6 numbers: RA h m s, Dec d m s
function aapParseCoordinates( text )
{
   let t = String( text ).trim();
   if ( !/^[+-]?\d/.test( t ) )
      return null;
   if ( /[^\d\s.,:+\-hmsd°'"]/i.test( t ) )
      return null;

   let tokens = t.replace( /,/g, "." ).match( /[+-]?\d+(\.\d+)?/g );
   if ( !tokens )
      return null;
   let v = tokens.map( x => Math.abs( parseFloat( x ) ) );
   let ra, dec, decToken;

   if ( tokens.length == 2 )
   {
      ra = parseFloat( tokens[0] );
      dec = v[1];
      decToken = tokens[1];
   }
   else if ( tokens.length == 4 )
   {
      ra = ( v[0] + v[1]/60 )*15;
      dec = v[2] + v[3]/60;
      decToken = tokens[2];
   }
   else if ( tokens.length == 6 )
   {
      ra = ( v[0] + v[1]/60 + v[2]/3600 )*15;
      dec = v[3] + v[4]/60 + v[5]/3600;
      decToken = tokens[3];
   }
   else
      return null;

   if ( decToken.charAt( 0 ) == "-" )
      dec = -dec;
   if ( !( ra >= 0 && ra < 360 && dec >= -90 && dec <= 90 ) )
      return null;
   return { ra: ra, dec: dec };
}

// Downloads a URL and returns { text, error }.
function aapDownloadText( url )
{
   let chunks = [];
   let T = new NetworkTransfer;
   T.setURL( url );
   T.onDownloadDataAvailable = function( data )
   {
      chunks.push( data );
      return true;
   };

   let ok = false;
   try
   {
      ok = T.download();
   }
   catch ( e )
   {
      return { text: "", error: aapErrorText( e ) };
   }

   if ( !ok )
   {
      let error = "";
      try
      {
         error = String( T.errorInformation || "" );
      }
      catch ( e )
      {
      }
      if ( !error )
      {
         try
         {
            error = "HTTP " + T.responseCode;
         }
         catch ( e )
         {
            error = "download failed";
         }
      }
      return { text: "", error: error };
   }

   let text = "";
   for ( let data of chunks )
   {
      if ( typeof data == "string" )
      {
         text += data;
         continue;
      }
      let part = null;
      try
      {
         part = data.utf8ToString();
      }
      catch ( e )
      {
         part = null;
      }
      if ( typeof part != "string" )
      {
         try
         {
            part = data.toString();
         }
         catch ( e )
         {
            part = "";
         }
      }
      text += part;
   }
   return { text: text, error: "" };
}

// Name resolvers, tried in order: [ label, URL prefix, parser ].
function aapParseSesame( text )
{
   let m = /%J\s+([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)/.exec( text );
   if ( !m )
      return null;
   return { ra: parseFloat( m[1] ), dec: parseFloat( m[2] ) };
}

function aapParseSimbad( text )
{
   let m = /Coordinates\(ICRS[^)]*\):\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([+-])(\d+)\s+(\d+)\s+([\d.]+)/.exec( text );
   if ( !m )
      return null;
   let ra = ( parseFloat( m[1] ) + parseFloat( m[2] )/60 + parseFloat( m[3] )/3600 )*15;
   let dec = parseFloat( m[5] ) + parseFloat( m[6] )/60 + parseFloat( m[7] )/3600;
   if ( m[4] == "-" )
      dec = -dec;
   return { ra: ra, dec: dec };
}

// Resolves an object name to coordinates online (CDS Sesame / SIMBAD).
// Returns { ra, dec } in degrees, or null. log receives the reason of each
// failed server.
function aapResolveObjectName( name, log )
{
   let servers = [
      [ "CDS Sesame", "https:/" + "/cds.unistra.fr/cgi-bin/nph-sesame/-oI/SNV?", aapParseSesame ],
      [ "Sesame (CfA)", "http:/" + "/vizier.cfa.harvard.edu/viz-bin/nph-sesame/-oI/SNV?", aapParseSesame ],
      [ "SIMBAD", "https:/" + "/simbad.cds.unistra.fr/simbad/sim-id?output.format=ASCII&Ident=", aapParseSimbad ]
   ];

   for ( let server of servers )
   {
      let reason = "";
      try
      {
         let result = aapDownloadText( server[1] + encodeURIComponent( name ) );
         if ( result.error )
            reason = result.error;
         else
         {
            let coords = server[2]( result.text );
            if ( coords != null && coords.ra >= 0 && coords.ra < 360 && coords.dec >= -90 && coords.dec <= 90 )
               return coords;
            reason = ( result.text.length == 0 ) ? "empty response" : "object not found";
         }
      }
      catch ( e )
      {
         reason = aapErrorText( e );
      }
      if ( log )
         log( aapTr( "lLookupServer", server[0], reason ) );
      CoreApplication.processEvents();
   }
   return null;
}

// ----------------------------------------------------------------------------
// Working parameters
// ----------------------------------------------------------------------------

class AAPParameters
{
   constructor()
   {
      this.language = "en";
      this.fileMode = false;          // false = open images, true = files
      this.profile = 0;               // 0 = automatic, 1..n = fixed profile
      this.interpolation = 0;
      this.forceDistortion = false;
      this.drizzleData = false;
      this.solveMode = 1;             // 0 = none, 1 = if missing, 2 = always
      this.solveOutputs = false;
      this.blurry = false;            // start with the blurry-star solver settings
      this.outputDir = "";
      this.postfix = "_r";
      this.referenceFile = "";
      this.sessionFiles = [];         // file list, kept across language switches
      this.focalLength = 0;           // mm, 0 = from image
      this.pixelSize = 0;             // um, 0 = from image
      this.objectHint = "";           // object name or coordinates, not persistent
      this.hintCache = null;          // { text, coords, name }
   }

   load()
   {
      this.language        = aapReadSetting( "language", DataType.String, this.language );
      this.fileMode        = aapReadSetting( "fileMode", DataType.Boolean, this.fileMode );
      this.profile         = aapReadSetting( "profile", DataType.Int32, this.profile );
      this.interpolation   = aapReadSetting( "interpolation", DataType.Int32, this.interpolation );
      this.forceDistortion = aapReadSetting( "forceDistortion", DataType.Boolean, this.forceDistortion );
      this.drizzleData     = aapReadSetting( "drizzleData", DataType.Boolean, this.drizzleData );
      this.solveMode       = aapReadSetting( "solveMode", DataType.Int32, this.solveMode );
      this.solveOutputs    = aapReadSetting( "solveOutputs", DataType.Boolean, this.solveOutputs );
      this.blurry          = aapReadSetting( "blurry", DataType.Boolean, this.blurry );
      this.outputDir       = aapReadSetting( "outputDir", DataType.String, this.outputDir );
      this.postfix         = aapReadSetting( "postfix", DataType.String, this.postfix );
      this.focalLength     = aapReadSetting( "focalLength", DataType.Double, this.focalLength );
      this.pixelSize       = aapReadSetting( "pixelSize", DataType.Double, this.pixelSize );

      if ( AAP_STRINGS[this.language] === undefined )
         this.language = "en";
      if ( this.profile < 0 || this.profile > AAP_PROFILES.length )
         this.profile = 0;
      if ( this.interpolation < 0 || this.interpolation >= AAP_INTERPOLATIONS.length )
         this.interpolation = 0;
      if ( this.solveMode < 0 || this.solveMode > 2 )
         this.solveMode = 1;
   }

   save()
   {
      aapWriteSetting( "language", DataType.String, this.language );
      aapWriteSetting( "fileMode", DataType.Boolean, this.fileMode );
      aapWriteSetting( "profile", DataType.Int32, this.profile );
      aapWriteSetting( "interpolation", DataType.Int32, this.interpolation );
      aapWriteSetting( "forceDistortion", DataType.Boolean, this.forceDistortion );
      aapWriteSetting( "drizzleData", DataType.Boolean, this.drizzleData );
      aapWriteSetting( "solveMode", DataType.Int32, this.solveMode );
      aapWriteSetting( "solveOutputs", DataType.Boolean, this.solveOutputs );
      aapWriteSetting( "blurry", DataType.Boolean, this.blurry );
      aapWriteSetting( "outputDir", DataType.String, this.outputDir );
      aapWriteSetting( "postfix", DataType.String, this.postfix );
      aapWriteSetting( "focalLength", DataType.Double, this.focalLength );
      aapWriteSetting( "pixelSize", DataType.Double, this.pixelSize );
   }
}

// ----------------------------------------------------------------------------
// Engine: alignment and plate solving. Independent of the user interface.
//
// callbacks = {
//    log( text ),
//    status( key, state, detail ),   state: "working" | "ok" | "failed"
//    progress( done, total )
// }
// ----------------------------------------------------------------------------

class AAPEngine
{
   constructor( parameters, callbacks )
   {
      this.parameters = parameters;
      this.log = callbacks.log || ( () => {} );
      this.status = callbacks.status || ( () => {} );
      this.progress = callbacks.progress || ( () => {} );
      this.lastSucceeded = 0;
      this.lastFailed = 0;
      this.lastTime = "";
   }

   profileSequence()
   {
      if ( this.parameters.profile == 0 )
         return AAP_PROFILES;
      return [ AAP_PROFILES[this.parameters.profile - 1] ];
   }

   newStarAlignment( profile )
   {
      let P = new StarAlignment;

      P.mode = StarAlignment.RegisterMatch;
      aapTrySet( P, "writeKeywords", true );
      aapTrySet( P, "generateMasks", false );
      aapTrySet( P, "generateDistortionMaps", false );
      aapTrySet( P, "inheritAstrometricSolution", true );
      aapTrySet( P, "noGUIMessages", true );
      aapTrySet( P, "maxStars", 0 );

      let interpolationId = AAP_INTERPOLATIONS[this.parameters.interpolation][1];
      if ( StarAlignment[interpolationId] !== undefined )
         aapTrySet( P, "pixelInterpolation", StarAlignment[interpolationId] );

      for ( let name in profile.params )
         aapTrySet( P, name, profile.params[name] );

      if ( this.parameters.forceDistortion )
      {
         aapTrySet( P, "distortionCorrection", true );
         aapTrySet( P, "localDistortion", true );
         aapTrySet( P, "useSurfaceSplines", true );
      }

      return P;
   }

   // --- Plate solving -------------------------------------------------------

   // Resolves the target hint (coordinates or object name) once per text.
   // Returns { coords, name } where coords may be null.
   resolveHint()
   {
      let text = String( this.parameters.objectHint || "" ).trim();
      if ( !text )
         return { coords: null, name: "" };

      let cache = this.parameters.hintCache;
      if ( cache && cache.text == text )
         return cache;

      let result = { text: text, coords: aapParseCoordinates( text ), name: "" };
      if ( result.coords == null )
      {
         // Built-in NGC / IC / Messier catalog first: no network needed.
         result.coords = aapCatalogLookup( text );
         result.name = text;
      }
      if ( result.coords == null )
      {
         this.log( aapTr( "lResolving", text ) );
         result.coords = aapResolveObjectName( text, t => this.log( t ) );
         result.name = text;
         if ( result.coords == null )
            this.log( aapTr( "lResolveFailed", text ) );
      }
      if ( result.coords != null )
         this.log( aapTr( "lResolved", result.name || text,
                       aapSexagesimal( result.coords.ra/15, false ),
                       aapSexagesimal( result.coords.dec, true ) ) );

      this.parameters.hintCache = result;
      return result;
   }

   // Solves the astrometry of a view with the ImageSolver library. The user's
   // hints (focal length, pixel size, target) replace the image metadata.
   // Tries the normal star detection first and then the blurry-star settings,
   // or only the blurry ones if requested. Returns true if solved.
   solveView( view )
   {
      let window = view.window;
      this.log( aapTr( "lSolve", view.id ) );

      if ( typeof ImageSolver == "undefined" )
      {
         this.log( aapTr( "lNoSolver" ) );
         return false;
      }

      let hint = this.resolveHint();
      let attempts = AAP_SOLVE_ATTEMPTS.filter( a => a.blurry || !this.parameters.blurry );
      let metaLogged = false;

      for ( let attempt of attempts )
      {
         if ( console.abortRequested )
            break;

         let name = aapTr( attempt.key );
         this.log( aapTr( "lAttempt", name ) );
         CoreApplication.processEvents();

         try
         {
            let solver = new ImageSolver();
            if ( typeof solver.initialize == "function" )
               solver.initialize( window );
            else
               solver.Init( window );

            // Start values.
            let m = solver.metadata;
            if ( hint.coords != null )
            {
               m.ra = hint.coords.ra;
               m.dec = hint.coords.dec;
            }
            if ( this.parameters.focalLength > 0 )
            {
               m.focal = this.parameters.focalLength;
               m.useFocal = true;
            }
            if ( this.parameters.pixelSize > 0 )
               m.xpixsz = this.parameters.pixelSize;
            if ( !m.referenceSystem )
               m.referenceSystem = "ICRS";
            if ( hint.coords != null )
               m.topocentric = false;
            if ( m.xpixsz > 0 && m.focal > 0 )
               if ( this.parameters.focalLength > 0 || this.parameters.pixelSize > 0 || !( m.resolution > 0 ) )
                  m.resolution = m.xpixsz/m.focal*0.18/Math.PI;

            if ( !metaLogged )
            {
               metaLogged = true;
               let num = ( x, d ) => ( typeof x == "number" && isFinite( x ) ) ? x.toFixed( d ) : "?";
               let ra = ( typeof m.ra == "number" && isFinite( m.ra ) ) ? aapSexagesimal( m.ra/15, false ) : "?";
               let dec = ( typeof m.dec == "number" && isFinite( m.dec ) ) ? aapSexagesimal( m.dec, true ) : "?";
               this.log( aapTr( "lMeta", ra, dec, num( m.focal, 0 ), num( m.xpixsz, 2 ),
                                num( m.resolution*3600, 3 ) ) );
               if ( ra == "?" || dec == "?" )
               {
                  this.log( aapTr( "lNoCoords" ) );
                  return false;
               }
               if ( !( m.resolution > 0 ) )
               {
                  this.log( aapTr( "lNoScale" ) );
                  return false;
               }
            }

            // Star detection settings of this attempt.
            let cfg = solver.solverCfg;
            for ( let key in attempt.cfg )
               cfg[key] = attempt.cfg[key];
            cfg.showStars = false;
            cfg.showStarMatches = false;
            cfg.showDistortion = false;
            cfg.generateErrorImg = false;

            if ( typeof solver.solveImage == "function" )
               solver.solveImage( window );
            else
               solver.SolveImage( window );

            if ( aapHasSolution( window ) )
            {
               this.log( aapTr( "lSolveOK", name ) );
               return true;
            }
            this.log( aapTr( "lAttemptFailed", name, "no solution" ) );
         }
         catch ( e )
         {
            this.log( aapTr( "lAttemptFailed", name, aapErrorText( e ) ) );
         }
      }

      this.log( aapTr( "lSolveFailed1" ) );
      this.log( aapTr( "lSolveFailed2" ) );
      return false;
   }

   solveReferenceIfNeeded( view )
   {
      let mode = this.parameters.solveMode;
      if ( mode == 0 )
         return;
      if ( mode == 1 && aapHasSolution( view.window ) )
      {
         this.log( aapTr( "lRefSolved" ) );
         return;
      }
      this.solveView( view );
   }

   // --- Best reference ------------------------------------------------------

   // Picks the view with the most detected stars.
   bestReference( views )
   {
      let best = null;
      let bestCount = -1;
      let done = 0;
      for ( let view of views )
      {
         let count = 0;
         try
         {
            let D = new StarDetector;
            count = D.stars( view.image ).length;
            this.log( aapTr( "lStars", view.id, count ) );
         }
         catch ( e )
         {
            this.log( aapTr( "lDetectFailed", view.id, e.message ) );
         }
         if ( count > bestCount )
         {
            bestCount = count;
            best = view;
         }
         this.progress( ++done, views.length );
      }
      return best;
   }

   // --- Open images ---------------------------------------------------------

   alignViews( referenceView, targetViews )
   {
      let T = new ElapsedTime;
      let succeeded = 0;
      let failed = [];
      let done = 0;

      this.progress( 0, targetViews.length );
      this.solveReferenceIfNeeded( referenceView );

      for ( let target of targetViews )
      {
         if ( console.abortRequested )
         {
            this.log( aapTr( "lAborted" ) );
            break;
         }

         this.log( aapTr( "lAligning", target.id ) );
         this.status( target.id, "working", "" );
         let ok = false;

         for ( let profile of this.profileSequence() )
         {
            let profileName = aapTr( profile.key );
            let before = ImageWindow.windows.map( w => w.mainView.id );
            let executed = false;
            try
            {
               let P = this.newStarAlignment( profile );
               P.referenceImage = referenceView.id;
               P.referenceIsFile = false;
               executed = P.executeOn( target, false/*swapFile*/ ) !== false;
            }
            catch ( e )
            {
               executed = false;
               this.log( "   [" + profileName + "] " + e.message );
            }

            let created = ImageWindow.windows.filter( w => before.indexOf( w.mainView.id ) < 0 );
            if ( executed && created.length > 0 )
            {
               let out = created[created.length - 1];
               this.log( "   OK [" + profileName + "] -> " + out.mainView.id );
               if ( this.parameters.solveOutputs && this.parameters.solveMode != 0 )
                  if ( !aapHasSolution( out ) )
                     this.solveView( out.mainView );
               this.status( target.id, "ok", profileName + "  ->  " + out.mainView.id );
               ok = true;
               break;
            }

            this.log( aapTr( "lNotWith", profileName ) );
            CoreApplication.processEvents();
         }

         if ( ok )
            ++succeeded;
         else
         {
            failed.push( target.id );
            this.status( target.id, "failed", "" );
         }

         this.progress( ++done, targetViews.length );
      }

      this.report( succeeded, failed, T );
      return failed.length == 0;
   }

   // --- File batch ----------------------------------------------------------

   expectedOutput( inputPath )
   {
      return this.parameters.outputDir + "/" + File.extractName( inputPath )
           + this.parameters.postfix + ".xisf";
   }

   // Opens the reference file, solves it and saves a solved copy.
   // Returns the reference path to be used.
   solveReferenceFile( path )
   {
      if ( this.parameters.solveMode == 0 )
         return path;

      let windows = null;
      try
      {
         windows = ImageWindow.open( path );
      }
      catch ( e )
      {
         this.log( aapTr( "lRefOpenFailed", e.message ) );
         return path;
      }
      if ( !windows || windows.length == 0 )
         return path;

      let window = windows[0];
      let result = path;
      try
      {
         if ( this.parameters.solveMode == 1 && aapHasSolution( window ) )
         {
            this.log( aapTr( "lRefSolved" ) );
         }
         else if ( this.solveView( window.mainView ) )
         {
            let solvedPath = this.parameters.outputDir + "/" + File.extractName( path ) + "_solved.xisf";
            if ( window.saveAs( solvedPath, false, false, false, false ) )
            {
               this.log( aapTr( "lRefSaved", solvedPath ) );
               result = solvedPath;
            }
         }
      }
      catch ( e )
      {
         this.log( "ImageSolver: " + e.message );
      }

      for ( let w of windows )
      {
         try
         {
            w.forceClose();
         }
         catch ( e )
         {
         }
      }
      return result;
   }

   alignFiles( referencePath, targetPaths )
   {
      let T = new ElapsedTime;

      if ( !File.directoryExists( this.parameters.outputDir ) )
         File.createDirectory( this.parameters.outputDir, true );

      let pending = targetPaths.slice();
      let total = pending.length;
      this.progress( 0, total );

      let reference = this.solveReferenceFile( referencePath );

      for ( let profile of this.profileSequence() )
      {
         if ( pending.length == 0 || console.abortRequested )
            break;

         let profileName = aapTr( profile.key );
         this.log( aapTr( "lProfilePass", profileName, pending.length ) );
         for ( let path of pending )
            this.status( path, "working", profileName );
         CoreApplication.processEvents();

         // Remember which output files already existed before this pass.
         let existedBefore = {};
         for ( let path of pending )
            existedBefore[path] = File.exists( this.expectedOutput( path ) );

         let P = this.newStarAlignment( profile );
         P.referenceImage = reference;
         P.referenceIsFile = true;
         P.targets = pending.map( path => [ true, true, path ] );
         P.outputDirectory = this.parameters.outputDir;
         aapTrySet( P, "outputExtension", ".xisf" );
         aapTrySet( P, "outputPrefix", "" );
         aapTrySet( P, "outputPostfix", this.parameters.postfix );
         aapTrySet( P, "overwriteExistingFiles", true );
         aapTrySet( P, "generateDrizzleData", this.parameters.drizzleData );
         if ( StarAlignment.Continue !== undefined )
            aapTrySet( P, "onError", StarAlignment.Continue );

         try
         {
            P.executeGlobal();
         }
         catch ( e )
         {
            this.log( "   " + e.message );
         }

         // Successful outputs from the output table of the process.
         let outputs = null;
         try
         {
            let data = P.outputData;
            if ( data && data.length > 0 )
            {
               outputs = {};
               for ( let row of data )
                  if ( row && row[0] )
                     outputs[aapNormPath( row[0] )] = row;
            }
         }
         catch ( e )
         {
            outputs = null;
         }

         let stillPending = [];
         for ( let path of pending )
         {
            let out = this.expectedOutput( path );
            let ok;
            if ( outputs != null )
               ok = outputs[aapNormPath( out )] !== undefined && File.exists( out );
            else
               ok = File.exists( out ) && !existedBefore[path];

            if ( ok )
            {
               let info = "";
               let detail = profileName;
               if ( outputs != null )
               {
                  let row = outputs[aapNormPath( out )];
                  if ( row.length > 7 && typeof row[3] == "number" && typeof row[7] == "number" )
                  {
                     let rms = format( "%.3f", row[7] );
                     info = aapTr( "lPairs", row[3], rms );
                     detail += "  -  RMS " + rms + " px";
                  }
               }
               this.log( "   OK  " + File.extractName( path ) + info );
               this.status( path, "ok", detail );
            }
            else
               stillPending.push( path );
         }
         pending = stillPending;
         this.progress( total - pending.length, total );
      }

      for ( let path of pending )
         this.status( path, "failed", "" );
      this.progress( total, total );

      this.report( total - pending.length, pending.map( p => File.extractName( p ) ), T );
      return pending.length == 0;
   }

   report( succeeded, failed, T )
   {
      this.lastSucceeded = succeeded;
      this.lastFailed = failed.length;
      this.lastTime = T.text;
      this.log( "------------------------------------------------------------" );
      this.log( aapTr( "lDone", succeeded, failed.length, T.text ) );
      for ( let name of failed )
         this.log( aapTr( "lFailedItem", name ) );
   }
}

// ----------------------------------------------------------------------------
// Dark theme
// ----------------------------------------------------------------------------

const AAP_STYLE =
   "QWidget { background-color: #13151a; color: #d7dae0; font-size: 9pt; }" +
   "QLabel { background: transparent; }" +
   "QGroupBox { background-color: #181b21; border: 1px solid #2a2f3a; border-radius: 8px; margin-top: 14px; padding-top: 10px; }" +
   "QGroupBox::title { subcontrol-origin: margin; left: 12px; padding: 1px 8px; color: #7fbcff; font-weight: bold; background-color: #13151a; border: 1px solid #2a2f3a; border-radius: 4px; }" +
   "QGroupBox QWidget { background-color: #181b21; }" +
   "QGroupBox QLabel, QGroupBox QCheckBox, QGroupBox QRadioButton { background: transparent; }" +
   "QPushButton, QGroupBox QPushButton { background-color: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #2b313d, stop:1 #222731); border: 1px solid #3a4150; border-radius: 5px; padding: 5px 14px; }" +
   "QPushButton:hover, QGroupBox QPushButton:hover { background-color: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #353d4c, stop:1 #2a303c); border-color: #6fb1ff; }" +
   "QPushButton:pressed, QGroupBox QPushButton:pressed { background-color: #1a1e26; }" +
   "QPushButton:disabled, QGroupBox QPushButton:disabled { color: #5c6370; border-color: #2a2e38; }" +
   "QLineEdit, QComboBox, QSpinBox, QTextEdit, QPlainTextEdit, QTreeView, QGroupBox QLineEdit, QGroupBox QComboBox, QGroupBox QTreeView { background-color: #0d0f13; border: 1px solid #2a2f3a; border-radius: 4px; padding: 3px; selection-background-color: #2d5f9e; selection-color: #ffffff; }" +
   "QLineEdit:focus, QComboBox:focus, QLineEdit:hover, QComboBox:hover { border-color: #6fb1ff; }" +
   "QLineEdit:disabled, QComboBox:disabled { color: #5c6370; }" +
   "QComboBox QAbstractItemView { background-color: #0d0f13; color: #d7dae0; selection-background-color: #2d5f9e; }" +
   "QHeaderView::section { background-color: #1c2028; color: #9aa3b2; border: none; border-bottom: 1px solid #2a2f3a; padding: 5px; font-weight: bold; }" +
   "QTreeView { alternate-background-color: #111318; }" +
   "QTreeView::item { padding: 3px 2px; }" +
   "QTreeView::item:hover { background-color: #1c2230; }" +
   "QTreeView::item:selected { background-color: #2d5f9e; color: #ffffff; }" +
   "QCheckBox, QRadioButton { background: transparent; spacing: 6px; }" +
   "QCheckBox:disabled, QRadioButton:disabled, QLabel:disabled { color: #5c6370; }" +
   "QScrollBar:vertical { background: #13151a; width: 12px; }" +
   "QScrollBar::handle:vertical { background: #3a4150; border-radius: 5px; min-height: 24px; }" +
   "QScrollBar::handle:vertical:hover { background: #6fb1ff; }" +
   "QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0; }" +
   "QToolTip { background-color: #0d0f13; color: #d7dae0; border: 1px solid #6fb1ff; }";

// "by Miltzu" as rich text: handwritten font, every letter on a cyan - violet - pink gradient
// (the same signature as in AutoFlat Pro).
const AAP_SIG_STOPS = [ 0x55c2ff, 0x9b8cff, 0xff7ac6 ];
function aapSignature( sizePt )
{
   let mix = ( c0, c1, t ) => [ 16, 8, 0 ].map( sh => Math.round( ((c0 >> sh) & 255) + (((c1 >> sh) & 255) - ((c0 >> sh) & 255))*t ) );
   let hex = rgb => "#" + rgb.map( v => ( v < 16 ? "0" : "" ) + v.toString( 16 ) ).join( "" );
   let txt = "by Miltzu", out = "";
   for ( let i = 0; i < txt.length; ++i )
   {
      let t = i/( txt.length - 1 ), n = AAP_SIG_STOPS.length - 1, k = Math.min( n - 1, Math.floor( t*n ) );
      let ch = txt.charAt( i );
      out += ( ch == " " ) ? "&nbsp;" : "<span style='color:" + hex( mix( AAP_SIG_STOPS[k], AAP_SIG_STOPS[k + 1], t*n - k ) ) + "'>" + ch + "</span>";
   }
   return "<span style=\"font-family:'Segoe Script','Lucida Handwriting','Brush Script MT','URW Chancery L','Z003',cursive; "
        + "font-size:" + sizePt + "pt; font-style:italic; font-weight:bold;\">" + out + "</span>";
}

const AAP_HEADER_STYLE =
   "background-color: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #1b3a66, stop:0.55 #16233a, stop:1 #13151a);"
   + " border: 1px solid #2d5f9e; border-radius: 8px;";

const AAP_PLAIN_STYLE = "background: transparent; border: none;";

const AAP_PRIMARY_STYLE =
   "QPushButton { background-color: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #4a90e2, stop:1 #2d5f9e);"
   + " border: 1px solid #7fbcff; border-radius: 5px; color: #ffffff; font-weight: bold; padding: 7px 32px; }"
   + "QPushButton:hover { background-color: qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 #5aa0f2, stop:1 #3873bd); }"
   + "QPushButton:pressed { background-color: #2d5f9e; }"
   + "QPushButton:disabled { background-color: #252a34; color: #7d8696; border-color: #2a2e38; }";

// Style of the progress bar label for a completed fraction in [0,1].
function aapProgressStyle( fraction, color )
{
   let base = "border: 1px solid #2a2f3a; border-radius: 5px; padding: 5px; color: #ffffff; font-weight: bold;";
   let f = Math.max( 0, Math.min( 1, fraction ) );
   if ( f <= 0 )
      return "QLabel { background-color: #0d0f13; color: #9aa3b2; " + base + " }";
   if ( f >= 1 )
      return "QLabel { background-color: " + color + "; " + base + " }";
   let f2 = Math.min( 1, f + 0.002 );
   return "QLabel { background-color: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 " + color
        + ", stop:" + f.toFixed( 4 ) + " " + color
        + ", stop:" + f2.toFixed( 4 ) + " #0d0f13, stop:1 #0d0f13); " + base + " }";
}

// ----------------------------------------------------------------------------
// Dialog
// ----------------------------------------------------------------------------

class AAPDialog extends Dialog
{
   constructor( parameters )
   {
      super();

      this.parameters = parameters;
      this.restart = false;
      this.logLines = [];
      this.targetKeys = [];           // view ids or file paths, parallel to tree nodes
      this.windowTitle = AAP_TITLE + " v" + AAP_VERSION;
      this.styleSheet = AAP_STYLE;

      let labelWidth = Math.max( this.font.width( aapTr( "outputDir" ) ),
                                  this.font.width( aapTr( "focal" ) ),
                                  this.font.width( aapTr( "reference" ) ) ) + 16;

      let makeLabel = text =>
      {
         let label = new Label( this );
         label.text = text;
         label.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;
         label.setFixedWidth( labelWidth );
         return label;
      };

      // --- Header -----------------------------------------------------------

      this.headerFrame = new Frame( this );
      this.headerFrame.styleSheet = AAP_HEADER_STYLE;

      this.titleLabel = new Label( this.headerFrame );
      this.titleLabel.useRichText = true;
      this.titleLabel.styleSheet = AAP_PLAIN_STYLE;
      this.titleLabel.text =
           "<span style=\"font-size:17pt; font-weight:bold; color:#ffffff;\">Auto Alignment </span>"
         + "<span style=\"font-size:17pt; font-weight:bold; color:#7fbcff;\">Pro</span>"
         + "<span style=\"font-size:9pt; color:#8fa3c0;\">&nbsp;&nbsp;v" + AAP_VERSION + "</span>";

      this.subtitleLabel = new Label( this.headerFrame );
      this.subtitleLabel.styleSheet = AAP_PLAIN_STYLE + " color: #a9b8d0;";
      this.subtitleLabel.text = aapTr( "subtitle" );

      this.languageLabel = new Label( this.headerFrame );
      this.languageLabel.styleSheet = AAP_PLAIN_STYLE + " color: #a9b8d0;";
      this.languageLabel.text = aapTr( "language" ) + ":";
      this.languageLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.languageCombo = new ComboBox( this.headerFrame );
      this.languageCombo.styleSheet = "QComboBox { background-color: #0d0f13; border: 1px solid #2d5f9e;"
         + " border-radius: 4px; padding: 3px; }";
      for ( let item of AAP_LANGUAGES )
         this.languageCombo.addItem( item[1] );
      for ( let i = 0; i < AAP_LANGUAGES.length; ++i )
         if ( AAP_LANGUAGES[i][0] == parameters.language )
            this.languageCombo.currentItem = i;
      this.languageCombo.onItemSelected = index =>
      {
         let language = AAP_LANGUAGES[index][0];
         if ( language != this.parameters.language )
         {
            this.collectParameters();
            this.parameters.language = language;
            this.parameters.sessionFiles = this.parameters.fileMode ? this.targetKeys.slice() : [];
            this.parameters.save();
            this.restart = true;
            this.ok();
         }
      };

      this.headerTextSizer = new VerticalSizer;
      this.headerTextSizer.spacing = 2;
      this.headerTextSizer.add( this.titleLabel );
      this.headerTextSizer.add( this.subtitleLabel );

      this.signatureLabel = new Label( this.headerFrame );
      this.signatureLabel.useRichText = true;
      this.signatureLabel.styleSheet = AAP_PLAIN_STYLE;
      this.signatureLabel.text = aapSignature( 14 );
      this.signatureLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.headerLangSizer = new HorizontalSizer;
      this.headerLangSizer.spacing = 8;
      this.headerLangSizer.addStretch();
      this.headerLangSizer.add( this.languageLabel );
      this.headerLangSizer.add( this.languageCombo );

      this.headerRightSizer = new VerticalSizer;
      this.headerRightSizer.spacing = 4;
      this.headerRightSizer.add( this.signatureLabel );
      this.headerRightSizer.add( this.headerLangSizer );

      this.headerFrame.sizer = new HorizontalSizer;
      this.headerFrame.sizer.margin = 12;
      this.headerFrame.sizer.spacing = 8;
      this.headerFrame.sizer.add( this.headerTextSizer );
      this.headerFrame.sizer.addStretch();
      this.headerFrame.sizer.add( this.headerRightSizer );

      // --- Mode -------------------------------------------------------------

      this.viewModeRadio = new RadioButton( this );
      this.viewModeRadio.text = aapTr( "modeViews" );
      this.viewModeRadio.checked = !parameters.fileMode;
      this.viewModeRadio.onCheck = checked =>
      {
         if ( checked )
         {
            this.parameters.fileMode = false;
            this.updateMode();
         }
      };

      this.fileModeRadio = new RadioButton( this );
      this.fileModeRadio.text = aapTr( "modeFiles" );
      this.fileModeRadio.checked = parameters.fileMode;
      this.fileModeRadio.onCheck = checked =>
      {
         if ( checked )
         {
            this.parameters.fileMode = true;
            this.updateMode();
         }
      };

      this.modeSizer = new HorizontalSizer;
      this.modeSizer.spacing = 16;
      this.modeSizer.add( this.viewModeRadio );
      this.modeSizer.add( this.fileModeRadio );
      this.modeSizer.addStretch();

      // --- Reference --------------------------------------------------------

      this.refViewLabel = makeLabel( aapTr( "reference" ) );

      this.refViewList = new ViewList( this );
      this.refViewList.getMainViews();
      if ( !ImageWindow.activeWindow.isNull )
         this.refViewList.currentView = ImageWindow.activeWindow.mainView;
      this.refViewList.toolTip = aapTr( "refTip" );
      this.refViewList.onViewSelected = () => this.fillViewTargets();

      this.autoRefButton = new PushButton( this );
      this.autoRefButton.text = aapTr( "autoRef" );
      this.autoRefButton.toolTip = aapTr( "autoRefTip" );
      this.autoRefButton.onClick = () => this.pickBestReference();

      this.refViewSizer = new HorizontalSizer;
      this.refViewSizer.spacing = 6;
      this.refViewSizer.add( this.refViewLabel );
      this.refViewSizer.add( this.refViewList, 100 );
      this.refViewSizer.add( this.autoRefButton );

      this.refFileLabel = makeLabel( aapTr( "reference" ) );

      this.refFileEdit = new Edit( this );
      this.refFileEdit.text = parameters.referenceFile;
      this.refFileEdit.toolTip = aapTr( "refFileTip" );
      this.refFileEdit.onEditCompleted = () =>
      {
         this.parameters.referenceFile = this.refFileEdit.text.trim();
      };

      this.refFileButton = new PushButton( this );
      this.refFileButton.text = aapTr( "browse" );
      this.refFileButton.onClick = () =>
      {
         let d = new OpenFileDialog;
         d.caption = aapTr( "dlgRef" );
         d.multipleSelections = false;
         d.loadImageFilters();
         if ( d.execute() )
         {
            let path = d.filePath || d.fileName;
            this.refFileEdit.text = path;
            this.parameters.referenceFile = path;
         }
      };

      this.refFileSizer = new HorizontalSizer;
      this.refFileSizer.spacing = 6;
      this.refFileSizer.add( this.refFileLabel );
      this.refFileSizer.add( this.refFileEdit, 100 );
      this.refFileSizer.add( this.refFileButton );

      // --- Targets ----------------------------------------------------------

      this.targetTree = new TreeBox( this );
      this.targetTree.numberOfColumns = 4;
      this.targetTree.setHeaderText( 0, aapTr( "colTarget" ) );
      this.targetTree.setHeaderText( 1, aapTr( "colSize" ) );
      this.targetTree.setHeaderText( 2, aapTr( "colType" ) );
      this.targetTree.setHeaderText( AAP_COL_STATUS, aapTr( "colStatus" ) );
      this.targetTree.headerVisible = true;
      this.targetTree.rootDecoration = false;
      this.targetTree.alternateRowColor = true;
      this.targetTree.multipleSelection = true;
      this.targetTree.setScaledMinHeight( 180 );

      this.addFilesButton = new PushButton( this );
      this.addFilesButton.text = aapTr( "addFiles" );
      this.addFilesButton.onClick = () =>
      {
         let d = new OpenFileDialog;
         d.caption = aapTr( "dlgTargets" );
         d.multipleSelections = true;
         d.loadImageFilters();
         if ( d.execute() )
         {
            let paths = d.filePaths || d.fileNames || [];
            for ( let path of paths )
               this.addFileTarget( path );
            this.targetTree.adjustColumnWidthToContents( 0 );
            if ( !this.parameters.outputDir && paths.length > 0 )
            {
               this.parameters.outputDir = File.extractDrive( paths[0] )
                  + File.extractDirectory( paths[0] ) + "/registered";
               this.outputDirEdit.text = this.parameters.outputDir;
            }
            this.updateCounter();
         }
      };

      this.clearFilesButton = new PushButton( this );
      this.clearFilesButton.text = aapTr( "clear" );
      this.clearFilesButton.onClick = () =>
      {
         this.clearTargets();
         this.updateCounter();
      };

      this.refreshViewsButton = new PushButton( this );
      this.refreshViewsButton.text = aapTr( "refresh" );
      this.refreshViewsButton.onClick = () => this.fillViewTargets();

      this.selectAllButton = new PushButton( this );
      this.selectAllButton.text = aapTr( "selectAll" );
      this.selectAllButton.onClick = () => this.setAllChecked( true );

      this.selectNoneButton = new PushButton( this );
      this.selectNoneButton.text = aapTr( "selectNone" );
      this.selectNoneButton.onClick = () => this.setAllChecked( false );

      this.invertButton = new PushButton( this );
      this.invertButton.text = aapTr( "invert" );
      this.invertButton.onClick = () =>
      {
         for ( let i = 0; i < this.targetTree.numberOfChildren; ++i )
            this.targetTree.child( i ).checked = !this.targetTree.child( i ).checked;
      };

      this.smartButton = new PushButton( this );
      this.smartButton.text = aapTr( "smart" );
      this.smartButton.toolTip = aapTr( "smartTip" );
      this.smartButton.onClick = () => this.fillViewTargets( true/*smart*/ );

      this.filterLabel = new Label( this );
      this.filterLabel.text = aapTr( "filter" );
      this.filterLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.filterEdit = new Edit( this );
      this.filterEdit.toolTip = aapTr( "filterTip" );
      this.filterEdit.onEditCompleted = () => this.selectMatching();

      this.matchButton = new PushButton( this );
      this.matchButton.text = aapTr( "selectMatching" );
      this.matchButton.toolTip = aapTr( "filterTip" );
      this.matchButton.onClick = () => this.selectMatching();

      this.filterSizer = new HorizontalSizer;
      this.filterSizer.spacing = 6;
      this.filterSizer.add( this.filterLabel );
      this.filterSizer.add( this.filterEdit, 100 );
      this.filterSizer.add( this.matchButton );
      this.filterSizer.add( this.smartButton );

      this.targetButtonsSizer = new HorizontalSizer;
      this.targetButtonsSizer.spacing = 6;
      this.targetButtonsSizer.add( this.addFilesButton );
      this.targetButtonsSizer.add( this.clearFilesButton );
      this.targetButtonsSizer.add( this.refreshViewsButton );
      this.targetButtonsSizer.addStretch();
      this.targetButtonsSizer.add( this.selectAllButton );
      this.targetButtonsSizer.add( this.invertButton );
      this.targetButtonsSizer.add( this.selectNoneButton );

      this.inputGroup = new GroupBox( this );
      this.inputGroup.title = aapTr( "grpImages" );
      this.inputGroup.sizer = new VerticalSizer;
      this.inputGroup.sizer.margin = 10;
      this.inputGroup.sizer.spacing = 6;
      this.inputGroup.sizer.add( this.modeSizer );
      this.inputGroup.sizer.add( this.refViewSizer );
      this.inputGroup.sizer.add( this.refFileSizer );
      this.inputGroup.sizer.add( this.targetTree, 100 );
      this.inputGroup.sizer.add( this.filterSizer );
      this.inputGroup.sizer.add( this.targetButtonsSizer );

      // --- Alignment settings -----------------------------------------------

      this.profileCombo = new ComboBox( this );
      this.profileCombo.addItem( aapTr( "profileAuto" ) );
      for ( let profile of AAP_PROFILES )
         this.profileCombo.addItem( aapTr( profile.key ) );
      this.profileCombo.currentItem = parameters.profile;
      this.profileCombo.toolTip = aapTr( "profileTip" );
      this.profileCombo.onItemSelected = index =>
      {
         this.parameters.profile = index;
      };

      this.interpolationLabel = new Label( this );
      this.interpolationLabel.text = aapTr( "interpolation" );
      this.interpolationLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.interpolationCombo = new ComboBox( this );
      for ( let item of AAP_INTERPOLATIONS )
         this.interpolationCombo.addItem( aapTr( item[0] ) );
      this.interpolationCombo.currentItem = parameters.interpolation;
      this.interpolationCombo.onItemSelected = index =>
      {
         this.parameters.interpolation = index;
      };

      this.alignRow1 = new HorizontalSizer;
      this.alignRow1.spacing = 6;
      this.alignRow1.add( makeLabel( aapTr( "profile" ) ) );
      this.alignRow1.add( this.profileCombo, 100 );
      this.alignRow1.addSpacing( 10 );
      this.alignRow1.add( this.interpolationLabel );
      this.alignRow1.add( this.interpolationCombo );

      this.distortionCheck = new CheckBox( this );
      this.distortionCheck.text = aapTr( "forceDistortion" );
      this.distortionCheck.checked = parameters.forceDistortion;
      this.distortionCheck.toolTip = aapTr( "forceDistortionTip" );
      this.distortionCheck.onCheck = checked =>
      {
         this.parameters.forceDistortion = checked;
      };

      this.drizzleCheck = new CheckBox( this );
      this.drizzleCheck.text = aapTr( "drizzle" );
      this.drizzleCheck.checked = parameters.drizzleData;
      this.drizzleCheck.onCheck = checked =>
      {
         this.parameters.drizzleData = checked;
      };

      this.alignRow2 = new HorizontalSizer;
      this.alignRow2.spacing = 16;
      this.alignRow2.addSpacing( labelWidth + 6 );
      this.alignRow2.add( this.distortionCheck );
      this.alignRow2.add( this.drizzleCheck );
      this.alignRow2.addStretch();

      this.outputDirLabel = makeLabel( aapTr( "outputDir" ) );

      this.outputDirEdit = new Edit( this );
      this.outputDirEdit.text = parameters.outputDir;
      this.outputDirEdit.onEditCompleted = () =>
      {
         this.parameters.outputDir = this.outputDirEdit.text.trim();
      };

      this.outputDirButton = new PushButton( this );
      this.outputDirButton.text = aapTr( "browse" );
      this.outputDirButton.onClick = () =>
      {
         let d = new GetDirectoryDialog;
         d.caption = aapTr( "dlgOutput" );
         if ( this.parameters.outputDir )
            d.initialPath = this.parameters.outputDir;
         if ( d.execute() )
         {
            this.parameters.outputDir = d.directory;
            this.outputDirEdit.text = d.directory;
         }
      };

      this.postfixLabel = new Label( this );
      this.postfixLabel.text = aapTr( "postfix" );
      this.postfixLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.postfixEdit = new Edit( this );
      this.postfixEdit.text = parameters.postfix;
      this.postfixEdit.setFixedWidth( this.font.width( "_registeredM" ) );
      this.postfixEdit.onEditCompleted = () =>
      {
         this.parameters.postfix = this.postfixEdit.text.trim();
      };

      this.outputRow = new HorizontalSizer;
      this.outputRow.spacing = 6;
      this.outputRow.add( this.outputDirLabel );
      this.outputRow.add( this.outputDirEdit, 100 );
      this.outputRow.add( this.outputDirButton );
      this.outputRow.add( this.postfixLabel );
      this.outputRow.add( this.postfixEdit );

      this.alignGroup = new GroupBox( this );
      this.alignGroup.title = aapTr( "grpAlign" );
      this.alignGroup.sizer = new VerticalSizer;
      this.alignGroup.sizer.margin = 10;
      this.alignGroup.sizer.spacing = 6;
      this.alignGroup.sizer.add( this.alignRow1 );
      this.alignGroup.sizer.add( this.alignRow2 );
      this.alignGroup.sizer.add( this.outputRow );

      // --- Plate solving ----------------------------------------------------

      this.solveCombo = new ComboBox( this );
      this.solveCombo.addItem( aapTr( "solveNone" ) );
      this.solveCombo.addItem( aapTr( "solveMissing" ) );
      this.solveCombo.addItem( aapTr( "solveAlways" ) );
      this.solveCombo.currentItem = parameters.solveMode;
      this.solveCombo.toolTip = aapTr( "solveTip" );
      this.solveCombo.onItemSelected = index =>
      {
         this.parameters.solveMode = index;
      };

      this.solveOutputsCheck = new CheckBox( this );
      this.solveOutputsCheck.text = aapTr( "solveOutputs" );
      this.solveOutputsCheck.checked = parameters.solveOutputs;
      this.solveOutputsCheck.toolTip = aapTr( "solveOutputsTip" );
      this.solveOutputsCheck.onCheck = checked =>
      {
         this.parameters.solveOutputs = checked;
      };

      this.solveRow1 = new HorizontalSizer;
      this.solveRow1.spacing = 6;
      this.solveRow1.add( makeLabel( aapTr( "solve" ) ) );
      this.solveRow1.add( this.solveCombo );
      this.solveRow1.addSpacing( 10 );
      this.solveRow1.add( this.solveOutputsCheck );
      this.solveRow1.addStretch();

      this.blurryCheck = new CheckBox( this );
      this.blurryCheck.text = aapTr( "blurry" );
      this.blurryCheck.checked = parameters.blurry;
      this.blurryCheck.toolTip = aapTr( "blurryTip" );
      this.blurryCheck.onCheck = checked =>
      {
         this.parameters.blurry = checked;
      };

      this.solveRow2 = new HorizontalSizer;
      this.solveRow2.spacing = 6;
      this.solveRow2.addSpacing( labelWidth + 6 );
      this.solveRow2.add( this.blurryCheck );
      this.solveRow2.addStretch();

      // Solver hints: focal length, pixel size and target.

      let numberWidth = this.font.width( "00000.000M" );

      this.focalEdit = new Edit( this );
      this.focalEdit.text = String( parameters.focalLength );
      this.focalEdit.setFixedWidth( numberWidth );
      this.focalEdit.toolTip = aapTr( "focalTip" );
      this.focalEdit.onEditCompleted = () =>
      {
         this.parameters.focalLength = aapParseNumber( this.focalEdit.text );
         this.focalEdit.text = String( this.parameters.focalLength );
      };

      this.focalUnitLabel = new Label( this );
      this.focalUnitLabel.text = "mm";

      this.pixelLabel = new Label( this );
      this.pixelLabel.text = aapTr( "pixel" );
      this.pixelLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.pixelEdit = new Edit( this );
      this.pixelEdit.text = String( parameters.pixelSize );
      this.pixelEdit.setFixedWidth( numberWidth );
      this.pixelEdit.toolTip = aapTr( "pixelTip" );
      this.pixelEdit.onEditCompleted = () =>
      {
         this.parameters.pixelSize = aapParseNumber( this.pixelEdit.text );
         this.pixelEdit.text = String( this.parameters.pixelSize );
      };

      this.pixelUnitLabel = new Label( this );
      this.pixelUnitLabel.text = "\u00B5m";

      this.objectLabel = new Label( this );
      this.objectLabel.text = aapTr( "object" );
      this.objectLabel.textAlignment = TextAlignment.Right | TextAlignment.VertCenter;

      this.objectEdit = new Edit( this );
      this.objectEdit.text = parameters.objectHint;
      this.objectEdit.toolTip = aapTr( "objectTip" );
      this.objectEdit.onEditCompleted = () =>
      {
         this.parameters.objectHint = this.objectEdit.text.trim();
      };

      this.lookupButton = new PushButton( this );
      this.lookupButton.text = aapTr( "lookup" );
      this.lookupButton.toolTip = aapTr( "objectTip" );
      this.lookupButton.onClick = () => this.lookupObject();

      this.hintRow = new HorizontalSizer;
      this.hintRow.spacing = 6;
      this.hintRow.add( makeLabel( aapTr( "focal" ) ) );
      this.hintRow.add( this.focalEdit );
      this.hintRow.add( this.focalUnitLabel );
      this.hintRow.addSpacing( 10 );
      this.hintRow.add( this.pixelLabel );
      this.hintRow.add( this.pixelEdit );
      this.hintRow.add( this.pixelUnitLabel );
      this.hintRow.addSpacing( 10 );
      this.hintRow.add( this.objectLabel );
      this.hintRow.add( this.objectEdit, 100 );
      this.hintRow.add( this.lookupButton );

      this.solveGroup = new GroupBox( this );
      this.solveGroup.title = aapTr( "grpSolve" );
      this.solveGroup.sizer = new VerticalSizer;
      this.solveGroup.sizer.margin = 10;
      this.solveGroup.sizer.spacing = 6;
      this.solveGroup.sizer.add( this.solveRow1 );
      this.solveGroup.sizer.add( this.hintRow );
      this.solveGroup.sizer.add( this.solveRow2 );

      // --- Log --------------------------------------------------------------

      this.logBox = new TextBox( this );
      this.logBox.readOnly = true;
      this.logBox.setScaledMinHeight( 120 );

      this.logGroup = new GroupBox( this );
      this.logGroup.title = aapTr( "grpLog" );
      this.logGroup.sizer = new VerticalSizer;
      this.logGroup.sizer.margin = 10;
      this.logGroup.sizer.add( this.logBox, 100 );

      // --- Progress bar -----------------------------------------------------

      this.progressLabel = new Label( this );
      this.progressLabel.textAlignment = TextAlignment.Center | TextAlignment.VertCenter;
      this.setProgress( 0, aapTr( "ready" ), "#3f86d9" );

      // --- Buttons ----------------------------------------------------------

      this.solveOnlyButton = new PushButton( this );
      this.solveOnlyButton.text = aapTr( "btnSolveOnly" );
      this.solveOnlyButton.toolTip = aapTr( "btnSolveOnlyTip" );
      this.solveOnlyButton.onClick = () => this.runSolveOnly();

      this.runButton = new PushButton( this );
      this.runButton.text = aapTr( "btnAlign" );
      this.runButton.styleSheet = AAP_PRIMARY_STYLE;
      this.runButton.onClick = () => this.runAlignment();

      this.closeButton = new PushButton( this );
      this.closeButton.text = aapTr( "btnClose" );
      this.closeButton.onClick = () =>
      {
         this.collectParameters();
         this.parameters.save();
         this.ok();
      };

      this.buttonsSizer = new HorizontalSizer;
      this.buttonsSizer.spacing = 8;
      this.buttonsSizer.add( this.solveOnlyButton );
      this.buttonsSizer.addStretch();
      this.buttonsSizer.add( this.runButton );
      this.buttonsSizer.add( this.closeButton );

      // --- Main layout ------------------------------------------------------

      this.sizer = new VerticalSizer;
      this.sizer.margin = 12;
      this.sizer.spacing = 8;
      this.sizer.add( this.headerFrame );
      this.sizer.add( this.inputGroup, 100 );
      this.sizer.add( this.alignGroup );
      this.sizer.add( this.solveGroup );
      this.sizer.add( this.logGroup, 50 );
      this.sizer.add( this.progressLabel );
      this.sizer.add( this.buttonsSizer );

      this.updateMode();

      // Restore the file list after a language switch.
      if ( parameters.fileMode && parameters.sessionFiles.length > 0 )
      {
         for ( let path of parameters.sessionFiles )
            this.addFileTarget( path );
         this.targetTree.adjustColumnWidthToContents( 0 );
      }
      parameters.sessionFiles = [];
      this.updateCounter();

      this.ensureLayoutUpdated();
      this.adjustToContents();
      this.setScaledMinWidth( 840 );
   }

   // --- Log and progress ----------------------------------------------------

   log( text )
   {
      console.writeln( text );
      let line = String( text ).replace( /</g, "(" ).replace( />/g, ")" );
      this.logLines.push( line );
      this.logBox.text = this.logLines.join( "<br>" );
      try
      {
         this.logBox.caretPosition = this.logBox.text.length;
      }
      catch ( e )
      {
      }
      CoreApplication.processEvents();
   }

   setProgress( fraction, text, color )
   {
      this.progressLabel.text = text;
      this.progressLabel.styleSheet = aapProgressStyle( fraction, color || "#3f86d9" );
      CoreApplication.processEvents();
   }

   updateCounter()
   {
      let count = this.targetKeys.length;
      this.inputGroup.title = aapTr( "grpImages" ) + ( count > 0 ? "  (" + count + ")" : "" );
   }

   // Copies the text fields to the parameters.
   collectParameters()
   {
      this.parameters.referenceFile = this.refFileEdit.text.trim();
      this.parameters.outputDir = this.outputDirEdit.text.trim();
      this.parameters.postfix = this.postfixEdit.text.trim();
      this.parameters.focalLength = aapParseNumber( this.focalEdit.text );
      this.parameters.pixelSize = aapParseNumber( this.pixelEdit.text );
      this.parameters.objectHint = this.objectEdit.text.trim();
   }

   // --- Mode switching ------------------------------------------------------

   updateMode()
   {
      let fileMode = this.parameters.fileMode;

      this.refViewLabel.visible = !fileMode;
      this.refViewList.visible = !fileMode;
      this.autoRefButton.visible = !fileMode;
      this.refreshViewsButton.visible = !fileMode;
      this.smartButton.visible = !fileMode;

      this.refFileLabel.visible = fileMode;
      this.refFileEdit.visible = fileMode;
      this.refFileButton.visible = fileMode;
      this.addFilesButton.visible = fileMode;
      this.clearFilesButton.visible = fileMode;

      this.outputDirLabel.enabled = fileMode;
      this.outputDirEdit.enabled = fileMode;
      this.outputDirButton.enabled = fileMode;
      this.postfixLabel.enabled = fileMode;
      this.postfixEdit.enabled = fileMode;
      this.drizzleCheck.enabled = fileMode;
      this.solveOutputsCheck.enabled = !fileMode;
      this.solveOnlyButton.enabled = !fileMode;

      this.clearTargets();
      if ( !fileMode )
         this.fillViewTargets();
      this.updateCounter();
   }

   referenceView()
   {
      let view = this.refViewList.currentView;
      if ( view == null || view.isNull )
         return null;
      return view;
   }

   clearTargets()
   {
      this.targetTree.clear();
      this.targetKeys = [];
   }

   addTargetNode( key, text, statusText, toolTip, sizeText, typeText, checked )
   {
      let node = new TreeBoxNode( this.targetTree );
      node.setText( 0, text );
      node.setText( 1, sizeText || "" );
      node.setText( 2, typeText || "" );
      node.setText( AAP_COL_STATUS, statusText );
      if ( toolTip )
         node.setToolTip( 0, toolTip );
      node.checkable = true;
      node.checked = ( checked === undefined ) ? true : checked;
      try
      {
         node.setTextColor( 1, AAP_COLOR_INFO );
         node.setTextColor( 2, AAP_COLOR_INFO );
         node.setTextColor( AAP_COL_STATUS, AAP_COLOR_INFO );
      }
      catch ( e )
      {
      }
      this.targetKeys.push( key );
   }

   // Should this open image be aligned? Returns { check, note }.
   // Left out: results of an earlier alignment, minimized windows and small
   // images (masks, thumbnails, previews made into images).
   classifyView( window, reference )
   {
      let view = window.mainView, img = view.image, id = view.id;
      let postfix = ( this.parameters.postfix || "" ).trim();
      let low = id.toLowerCase();
      if ( low.indexOf( "_registered" ) >= 0 || ( postfix.length > 0 && low.endsWith( postfix.toLowerCase() ) ) )
         return { check: false, note: aapTr( "nAligned" ) };
      if ( window.iconic )
         return { check: false, note: aapTr( "nIconic" ) };
      if ( Math.min( img.width, img.height ) < 256 )
         return { check: false, note: aapTr( "nSmall" ) };
      if ( reference != null && ( img.width != reference.image.width || img.height != reference.image.height ) )
         return { check: true, note: aapTr( "nOtherSize" ) };
      return { check: true, note: "" };
   }

   // Lists the open images. The user's own check marks are kept when the list
   // is refreshed; smart = true applies the automatic choice to every image.
   fillViewTargets( smart )
   {
      if ( this.parameters.fileMode )
         return;

      // remember the current check marks (by view id)
      if ( !this.userChecks )
         this.userChecks = {};
      let n = Math.min( this.targetTree.numberOfChildren, this.targetKeys.length );
      for ( let i = 0; i < n; ++i )
         this.userChecks[this.targetKeys[i]] = this.targetTree.child( i ).checked;
      if ( smart )
         this.userChecks = {};

      let reference = this.referenceView();
      this.clearTargets();
      let total = 0, checkedCount = 0;
      for ( let window of ImageWindow.windows )
      {
         let view = window.mainView;
         if ( reference != null && view.id == reference.id )
            continue;
         let c = this.classifyView( window, reference );
         let checked = ( this.userChecks[view.id] !== undefined ) ? this.userChecks[view.id] : c.check;
         let img = view.image;
         let status = c.note;
         if ( aapHasSolution( window ) )
            status = aapTr( "stSolved" ) + ( status ? ",  " + status : "" );
         this.addTargetNode( view.id, view.id, status, "", img.width + " x " + img.height,
                             img.isColor ? aapTr( "typeColor" ) : aapTr( "typeMono" ), checked );
         ++total;
         if ( checked )
            ++checkedCount;
      }
      for ( let col = 0; col < 3; ++col )
         this.targetTree.adjustColumnWidthToContents( col );
      this.updateCounter();
      if ( smart )
         this.log( aapTr( "lSmart", checkedCount, total ) );
   }

   // Checks only the images whose name contains one of the filter words.
   selectMatching()
   {
      let words = this.filterEdit.text.split( "," ).map( w => w.trim().toLowerCase() ).filter( w => w.length > 0 );
      if ( words.length == 0 )
         return;
      let n = Math.min( this.targetTree.numberOfChildren, this.targetKeys.length ), hits = 0;
      for ( let i = 0; i < n; ++i )
      {
         let name = this.targetTree.child( i ).text( 0 ).toLowerCase();
         let match = words.some( w => name.indexOf( w ) >= 0 );
         this.targetTree.child( i ).checked = match;
         if ( match )
            ++hits;
      }
      this.log( aapTr( "lSmart", hits, n ) );
   }

   addFileTarget( path )
   {
      if ( this.targetKeys.indexOf( path ) >= 0 )
         return;
      this.addTargetNode( path, File.extractName( path ) + File.extractExtension( path ), "", path,
                          "", File.extractExtension( path ).replace( ".", "" ).toUpperCase() );
   }

   // Updates the status column of the target identified by key.
   setTargetStatus( key, state, detail )
   {
      let index = this.targetKeys.indexOf( key );
      if ( index < 0 || index >= this.targetTree.numberOfChildren )
         return;

      let text, color;
      if ( state == "ok" )
      {
         text = aapTr( "stOK" );
         color = AAP_COLOR_OK;
      }
      else if ( state == "failed" )
      {
         text = aapTr( "stFailed" );
         color = AAP_COLOR_FAILED;
      }
      else
      {
         text = aapTr( "stWorking" );
         color = AAP_COLOR_WORKING;
      }
      if ( detail )
         text += "  -  " + detail;

      let node = this.targetTree.child( index );
      node.setText( AAP_COL_STATUS, text );
      try
      {
         node.setTextColor( AAP_COL_STATUS, color );
      }
      catch ( e )
      {
      }
      CoreApplication.processEvents();
   }

   setAllChecked( checked )
   {
      for ( let i = 0; i < this.targetTree.numberOfChildren; ++i )
         this.targetTree.child( i ).checked = checked;
   }

   checkedKeys()
   {
      let keys = [];
      let n = Math.min( this.targetTree.numberOfChildren, this.targetKeys.length );
      for ( let i = 0; i < n; ++i )
         if ( this.targetTree.child( i ).checked )
            keys.push( this.targetKeys[i] );
      return keys;
   }

   checkedViews()
   {
      let views = [];
      for ( let id of this.checkedKeys() )
      {
         let view = View.viewById( id );
         if ( view != null && !view.isNull )
            views.push( view );
      }
      return views;
   }

   setBusy( busy )
   {
      this.runButton.enabled = !busy;
      this.runButton.text = busy ? aapTr( "btnWorking" ) : aapTr( "btnAlign" );
      this.closeButton.enabled = !busy;
      this.languageCombo.enabled = !busy;
      this.lookupButton.enabled = !busy;
      this.solveOnlyButton.enabled = !busy && !this.parameters.fileMode;
      CoreApplication.processEvents();
   }

   warn( text )
   {
      ( new MessageBox( text, AAP_TITLE, StdIcon.Warning, StdButton.Ok ) ).execute();
   }

   newEngine()
   {
      return new AAPEngine( this.parameters, {
         log: text => this.log( text ),
         status: ( key, state, detail ) => this.setTargetStatus( key, state, detail ),
         progress: ( done, total ) =>
         {
            let fraction = ( total > 0 ) ? done/total : 0;
            this.setProgress( fraction, aapTr( "progress", done, total ), "#3f86d9" );
         }
      } );
   }

   // --- Actions -------------------------------------------------------------

   // Resolves the target field now, so the user sees the coordinates.
   lookupObject()
   {
      this.collectParameters();
      if ( !this.parameters.objectHint )
      {
         this.warn( aapTr( "wNoObject" ) );
         return;
      }
      this.setBusy( true );
      try
      {
         this.parameters.hintCache = null;
         let hint = this.newEngine().resolveHint();
         if ( hint.coords != null )
            this.setProgress( 1, ( hint.name || this.parameters.objectHint ) + ":  RA "
               + aapSexagesimal( hint.coords.ra/15, false ) + "   Dec "
               + aapSexagesimal( hint.coords.dec, true ), "#2e9e63" );
         else
            this.setProgress( 1, aapTr( "lResolveFailed", this.parameters.objectHint ).trim(), "#b8862b" );
      }
      catch ( e )
      {
         this.log( aapTr( "lError", e.message ) );
      }
      this.setBusy( false );
   }

   pickBestReference()
   {
      // search among the checked images (and the current reference); if fewer
      // than two, among every open image
      let views = this.checkedViews();
      let current = this.referenceView();
      if ( current != null )
         views.unshift( current );
      if ( views.length < 2 )
         views = ImageWindow.windows.map( w => w.mainView );
      if ( views.length < 2 )
      {
         this.warn( aapTr( "wTwoImages" ) );
         return;
      }
      this.setBusy( true );
      try
      {
         this.log( aapTr( "lFindBest" ) );
         let best = this.newEngine().bestReference( views );
         if ( best != null )
         {
            this.refViewList.currentView = best;
            this.fillViewTargets();
            this.log( aapTr( "lReference", best.id ) );
            this.setProgress( 1, aapTr( "lReference", best.id ), "#2e9e63" );
         }
      }
      catch ( e )
      {
         this.log( aapTr( "lError", e.message ) );
      }
      this.setBusy( false );
   }

   runAlignment()
   {
      this.collectParameters();
      this.parameters.save();

      let engine = this.newEngine();
      let executed = false;

      console.show();
      console.abortEnabled = true;
      this.setBusy( true );
      try
      {
         if ( this.parameters.fileMode )
         {
            let files = this.checkedKeys();
            let reference = this.parameters.referenceFile;
            if ( !reference && files.length > 0 )
               reference = files[0];
            files = files.filter( path => aapNormPath( path ) != aapNormPath( reference ) );

            if ( !reference || !File.exists( reference ) )
               this.warn( aapTr( "wRefFile" ) );
            else if ( files.length == 0 )
               this.warn( aapTr( "wOneFile" ) );
            else if ( !this.parameters.outputDir )
               this.warn( aapTr( "wOutputDir" ) );
            else
            {
               this.log( aapTr( "lReference", reference ) );
               engine.alignFiles( reference, files );
               executed = true;
            }
         }
         else
         {
            let reference = this.referenceView();
            let views = this.checkedViews();
            if ( reference == null )
               this.warn( aapTr( "wRefView" ) );
            else if ( views.length == 0 )
               this.warn( aapTr( "wOneView" ) );
            else
            {
               this.log( aapTr( "lReference", reference.id ) );
               engine.alignViews( reference, views );
               executed = true;
            }
         }
      }
      catch ( e )
      {
         this.log( aapTr( "lError", e.message ) );
      }

      if ( executed )
         this.setProgress( 1, aapTr( "sumDone", engine.lastSucceeded, engine.lastFailed, engine.lastTime ),
                           ( engine.lastFailed == 0 ) ? "#2e9e63" : "#b8862b" );

      console.abortEnabled = false;
      this.setBusy( false );
   }

   runSolveOnly()
   {
      this.collectParameters();
      this.parameters.save();

      let views = [];
      let reference = this.referenceView();
      if ( reference != null )
         views.push( reference );
      views = views.concat( this.checkedViews() );
      if ( views.length == 0 )
      {
         this.warn( aapTr( "wNoViews" ) );
         return;
      }

      let engine = this.newEngine();
      console.show();
      this.setBusy( true );
      let solved = 0;
      let done = 0;
      this.setProgress( 0, aapTr( "progress", 0, views.length ), "#3f86d9" );
      for ( let view of views )
      {
         try
         {
            if ( engine.solveView( view ) )
               ++solved;
         }
         catch ( e )
         {
            this.log( aapTr( "lError", e.message ) );
         }
         ++done;
         this.setProgress( done/views.length, aapTr( "progress", done, views.length ), "#3f86d9" );
      }
      this.log( aapTr( "lSolveDone", solved, views.length ) );
      this.fillViewTargets();
      this.setProgress( 1, aapTr( "sumSolve", solved, views.length ),
                        ( solved == views.length ) ? "#2e9e63" : "#b8862b" );
      this.setBusy( false );
   }
}

// ----------------------------------------------------------------------------
// Entry point
// ----------------------------------------------------------------------------

function aapMain()
{
   let parameters = new AAPParameters;
   parameters.load();

   // The dialog is rebuilt when the user switches the language.
   for ( ;; )
   {
      AAP_LANG = parameters.language;
      let dialog = new AAPDialog( parameters );
      dialog.execute();
      if ( !dialog.restart )
         break;
   }

   parameters.save();
}

// ----------------------------------------------------------------------------
// Built-in object catalog: J2000 coordinates of all NGC, IC and Messier
// objects (from the OpenNGC database, CC-BY-SA-4.0), so that the target field
// works without a network connection. Six base-36 characters per object:
// three for right ascension and three for declination.
// ----------------------------------------------------------------------------

const AAP_CATALOG_NGC = [
   "06jnjh06knja06kjnr06ojoa071p2l08lont07jc0m07wmrm081mrh07qb8807uphm07vix707xoop07wl5v085mbo086njn",
   "0a0fkt08gnjo09molh08lont09poo408unkd08wn6n08yd090906lg09en5z09insr09e6lo09poo409rme809l6lp09tlrb",
   "09viqg0a0fkt0a2flg0a8ja00a96lw0amgvs0b3o7m0bqwi50bjmek0bnmf40bqo6l0bwo990codd30crj730d2gke0cnrna",
   "0cyrnd0dagj40d4rnf0d7lps0d95xn0dmgkt0dfa5s0dtkhl0dzlgr0d2gke0dwdpl0edhxt0ergqi0fefaw0fzkaf0frgmv",
   "0h3df90h6dev0geo0e0gho0i0gio0a0gjo0k0gko0g0gno0a0gsexo0gyo0f0hijaf0honzi0i1dhr0iei5z0iymih0j2mgy",
   "0j4mh50j6mhp0j8mhi0j8miu0jami20jcmie0j489v0j889s0ja89m0jomh90jomh10je89w0jvmhc0k0mhv0k0k3j0k2mib",
   "0k9ny50kk8y20lll5j0lnlap0ljbhq0m5f7i0mru9i0lo3l00mrkkr0m9gyx0n5gcd0nenub0nmmd00oowa00nzhh30o5oc9",
   "0o8hhz0oahn50o3b9j0oeggs0ohi9l0okhn60oa6lr0orhp30o43oy0ovho60owhoa0p3hmy0pyikf0q8ik80qaiko0qcikm",
   "0qzu1i0qeiko0qobcj0r6if20s6uo40rcbcn0slfbz0sduau0rvk1h0rwj150s0j0k0s7o5p0s6j1a0s1dh50s5dhk0s8dgy",
   "0slgyw0trunt0twrp90uubn50ugo570uucft0ung240tl3dj0ung240uwfgv0v7fuh0v5gby0vbgbj0vlgbw0v56ub0whmsh",
   "0w0hfh0wjmsi0wefz40wwijs0wufz80w8fa00vudbp0wzdhb0x6msq0x3idk0xme0h0xidhd0xiidz0xac3r0xme0h0wd3d7",
   "0xtdhn0z8f5y0y0efh0y6jq60yknw70yeijn0ynnwh0yrnw00z3ro00ylims0zkf2h16qz1x0znu7v0z1jet0z3g760zbi68",
   "0zeinz0zeilv0zng5s0zdi6k0zei6f0zgik50zmiml0zmiks0zmi660zpipg0zpios0zsinr10cqc410hq5b0zqf5h109iju",
   "0z6ea010jf840zpios1076rp112lak11cn3l10q6r911bdsh11ffzu15wp9j11zi6i10g3bi12fq6810o3bm121i6312hq94",
   "139ucp12moik12dhoz12mmp712smp9127d9v1103bv12idad139o47137kv912mdah134ila134hz31337yo146h8x14jj80",
   "1363b81373b715fnzp157evp15hhnl16dfmi16fduj14v3bo1503du16jjky174lx3178niv16tcxx16qbpr170fpf15b3ar",
   "178jnq17enj4179hg017qnjd15t3dn17xoe317xfdm17jacp16g3az18toge1793cf195gyl17j3al19ig9p19nhm81aap5w",
   "19qgmf19xgl619zgl41awdgp1a6ga31avric1ayhk01b9mvb1bptbo1bgo4l1bwfd71c2fd91c5fd81c6fdl1c4ohv1bicok",
   "1bgbrb1a43d81c5g8v1bh3fn1cugjw1bs3bo1hlocx1dmob31dhgj31djgj71c23k61deago1eofv51esfv81dfeo31eimtp",
   "1eqkev1ct3jv1ewhn81exhn51f1g0m1f4hna1fso201en7fz1fzo2m1f7blv1g1o2j1g3o2j1fwqrb1gao321fa98d1gwdty",
   "1fwgzd1fg9961f17ek1fj9t31g1gz61gjndf1g5gz21f97ey1g8gzh1eo3ia16fhgc1gyjf71gzepe1gyaz61heecp1g9ebm",
   "1hvghf1iko4t1fy33s1ijgmk1ipg5v1irgn81gkdcs1gldcr1j8gmf1h63kc1jfgni1is7cn1jogn11jrgn21jshm21jyh5f",
   "1k6hlw1kymgv1ktgqg1ktglo1l1gqc1mouej1lvhuh1kl4vm1jy3og1kx3tw1nneow1m8hu71lwaz41nsug11n8fko1ly9ce",
   "1mneg41o2ohh1l53l71o2ohh1oaogm1oeok41oeogw1li3fo1nxdxl1nlbyp1ojoi51okohv1phube1oooha1ooohd1ooogi",
   "1oqogp1osoh01otoh71p0ogm1pnpxs1p4ohi1oni6n1pkomk1prpxf1plomn1mm3lo1pciwm1poomd1q0oi31q3oiy1q5ojo",
   "1q8ojv1qbok71qbojt1qip551pq8nz1oo40v1rkomi1rsomo1qmau71rwomo1p53na1rbdzw1tahfv1s6ome1r3awg1p63j1",
   "1rzedc1rjbye1pg3f91syofa1t1ofa1qh3na1s8c5i1sbads1trpr41tjhxw1t3bl51tni721tohxi1tphy61uooqn1sl5p0",
   "1vnu0w1t06cm1umiew1wdtrh1uyj6o1u8af41ufbnf1tj6cd1uhbn41v6hsn1vmoob1w9o7r1veids1wgiux1w2om21vrhoa",
   "1wiom81vyhts1wlom21wmo7f1woolp1uy6x41wdj1a1ud3cb1zltno1ve3ot1yclig1v63cf1xmb8c1ydiuf1z3l9j1ziozo",
   "1w43c01xi67u1z9inr1zuojx1zlkz21zsioj200kyg20fojh1zxlb4204iol201kyz20bl7c217q3i205div215irt20jg0v",
   "213g5o20b9t121ropc1zm6am21bjej21kj2h21qeq421mj1u21qjua21uj2n217b6q220j3021yi6t22nomu22nooz22vope",
   "226htp22vop422voow22ej2s231oop22njt5235onz234on222ojw6238onc23bonf23bonm232jvx23jop6236k9a23los4",
   "240orc23okl0246ooz23qjwr249ooo23vjv6241ho6245ira244icg24ajzy24tosz24bjwo24ejxv23laz423laz6250oqf",
   "254oxx248hok25poy824rjup24zicn24aadh24zhpv25qoxu24tosz24whou24ued826gdzq256hq225voxn259hqo24oadq",
   "25ehqc24padw25fhqb25ghr624maec261iek26xpfp25kooi25looi26gdgd26hdg426idgk25sho726khlt28munr26phm8",
   "27hov027nrod24ued8271hmg27dhql285ogs26cfy3276auu287k85283ht628yoi027ra4z29rq91285avo29pmad2827oh",
   "29mhln29gdgs2amoq029mhln2c1u4q2asop028reby2a8gmj2ajhta2aggmd2bbp2k2bio4n2befla2cbqzh2c6p4t2bwo4m",
   "2b4fj12boeox2c7o4z2blgld2b1bat2cho4q2bmfk82bsgjc2btfk328i3ad2d9o1n2d4o5n2djq8z2ddma72cugim2dxoqb",
   "2eruwn2cvdyy2cvdz32ckap92cvc462eaoqi2dlgj52ehor52cng1m2eaoqi2deapa2fbqgp2f5p3o2eei4r2dlap92eafzz",
   "2dl9pn2dpa652eaoqi2f1l5n2h3wkm2e2a4m2f4j602fkj6b2eraja2ghp2m2ghdew2h7ghw2krut12hojg32h3c0j2hhg4b",
   "2gs9ht2h7c0m2dj2w02h09he2i5j582fp50r2hyg5g2gtefm2i4g582k3sbc2k3sbc2injlh2k7p4l2lludj2jqfdt2k8n88",
   "2l0t602jykiq2lyu4t2kqkq82ltnqo2m5pje2nnu8r2leiue2mgk312niovh2mgdez2nrpai2okp412oonkr2oakmh2p4nhi",
   "2pjkay2s6mgz2q8km12q2j6j2qbklz2qhmed2qrp5n2qtme62q9fwx2q6f062qtkc82r8nj12oy7g42q2d8n2rip9v2rop21",
   "2qwci82p1enl2rnmco2pu89q2rhj882rwmed2s4mil2qkb0o2s6mgz2qrb172roflc2t2p7g2ryg252s7h6t2tep8f2tep83",
   "2tfp882soj9c2sbgar2tip8a2tkp8s2tmp7k2t8li32tupd32vug6l2u5p8s2twffb2tpkjh2ujp8u2twiu72ualyu2tpf93",
   "2vapvj2vbm502ued8y2ued8y2tcep22vzfu82ugatu2vjiue2ugatu2vsj4k2vgg742wtpcy2wxolz2u5elm2wzou22x0olw",
   "2x0oly2x3om02x8oni2x8olp2wqj4i2wrj4i2you162ynt3e2uq6nu2y2qze2xrg3v2wqh3u2w4c0k2xson32xton22xupke",
   "2xyp6l2ux6nb2wrg6r2v1enp2vgg742w5hdx2y2p9n2y0oo52y2oob2xagx32wrg6r2xdesc2yxmz72yujo32yzg2z2yti3t",
   "2zno6j2zblsg334whf2zelsu2yzfp32zmksu2ypcqo2zxmq8308oaa30ao9g2zqgt230jnn7305kj42xx6fx310odj316nrm",
   "31iod531al4n30qg76310gmx327oew318gxb31kjp7321l5432moe9329loa2zu6u22x235m333pmf330oey31zhz931zhz2",
   "33dpng2z74fc33dl7f33no5z342nrf336g0h34gnsp33kdc533wg9334ykne344fz7366qwx31g4b839keuf39leu537cnum",
   "36tlfu37vpr637qnuh37lkvb37jk753609ro36mcwt367apj37pj9j38ho5b382jle395pu537ugfw383gg238mj7w39xp3w",
   "38ffz139xpj638hfz039ddl7399dih38ofyy38rfyo399jkh3a6phz38vgg43a1of3398j7k3b3pht3azqwv3azqwv39afxo",
   "396dja3a4hpa3a3ir73816ni3ajg4z3adatz3cnnkp3cahuu3bdbm03b9di73cahuu3dio5l3eap6k3br9ld3d4huh3dxj77",
   "3ennpw3d4huh3fdi8y3eehuv3h3tf83fgkwk3fhkwq3dwefz3ewfqa3efdc83fdi8y3g4kwj3g7kwp3g4dbm3f6g7g3gmh5p",
   "3gwgo73hpl5u3h6gn33katff3d4huh3kwur73hlesa3fp6103h79ne3jtoni3kbqgw3isddl3hz9pw3jfgwb3jggw83mxuej",
   "3j0b973l0qe13jpdu23l7nav3l8nb73k5enw3lmngy3lpngu3kgg983mrqf13kqduv3ksdr43muqen3mwqd43n5qe23n5qcs",
   "3n6qcy3nhqff3n7nfz3n8ng53njodr3n9lp63nnnfx3p3r6t3nwetw3mkd1j3ouqe83o4m3k3okopr3nihxl3nzkfi3oxnfz",
   "3olfkz3p3m2g3pfo9f3p4m2e3qdr6j3othy83pdlx33ovhro3qjqg63ppm213nq93z3qiobt3pmhrp3q9ftz3q9fu13o1f3h",
   "3prfw43rlqg23ppe6w3pwfwa3rqpfd3qafsm3q2dj33qiobt3s2nx13pz9pw3rihs03t9qx23tztih3rnheu3t6p3k3sjg51",
   "40ygm23tenm33rhh5n3s0ask3t6e9s3sme0u3t0ek13upow83uqol73usolf3uuoli3utnv13uwoi13v0ol93u1jx43umm71",
   "3trfuj3vbokg3sh93f3vsq6n3tpfsz3vvq693z1ox93v9mok3v6g8q3u8a6v3x5ony3vxg4m3ueep43wokbt3w0gkh3xpm7x",
   "3x3ier3x3ier3ypqb03ytqbu3xjjgm3xkjgt3yxqc03yyqai3zaqc13z1ox93zdq693xxie73zjqap3xufsm3y3ifi3y5iez",
   "3yhigm3xufsm3xwfsr3zco133y2fp53y8g323ydhqi3yiif93y2fsq3ydg3a3ymidq3yvig23yxify3ypgnx40dpt83zak63",
   "3wp70z3zejb442cubg3zok623znk5p3zvllr3wz7103zgi7v409g8t3yfeu63zjgdf40glux3zzhni403iav41xqjr42wqas",
   "40egwt40dgba40pi9o410jqw40gfqs413jqs40igdc40kgak3zub5c42coya40ygm240zgck42wqas421ln541li3642jnpq",
   "42rohx435pgu42cllk42xohg42yohr432ohq41ygvw426g4l41wezc43goht43goi242fhzw42pgcb431izr42tg8t436i27",
   "43bi9w439eqn437erc435f1r45fq0n43qg3x43dc7644nh2244levr454gd3454exf45eghf45sipy475q8y45shwe46dl8n",
   "45kezh45xhy744uehr44yehp47govt46qhxy46vixe43g60m45pby044fegu44segi451egn47fiwy46idk347af7h47shy1",
   "43ceux49mqc148ejm947sger46yknf489gfk47skng484kn7493kny487eln49ekni49jko04a3kmx48zfkf47geeh486f3t",
   "49lhni4bkqfv4bkqfv4agcuy4aieo44b3hqo4blknf4fxj7d4d0qbd4czqbj4d4qb74blhqt4bgg8l4ccklp49p70i49t706",
   "4cnilb4eyqlx4bif3e4d4fzs4dnhyp4dphyo4dnhyp4dphyo4d4e9t4fvra94dng6c4fdggn4fohxr4fcezn4fdezw4ftgg4",
   "4gdio74gbfxd4gefxh4hqn1p4gbez54fhf4c4ipqmr4j4qzo4j4qz94h1fiq4iceki4jtqil4gxbkw4ijkd94jjp1h4ipkcr",
   "4l8r9z4k7nex4llqog4jgf164lkqh54mzqke4m3qgu4m4qh84m6qh04m7qgn4kee7x4joezs4jjezm4l5g2d4mbqh14x3y5p",
   "4kpg694mzqke4kddfc4ldewi4l2evi4l3ev84l6ev24l8ev44ncqvj4lghs14l7flb4l8fl14nmqt84nmqdb4laevl4ljfln",
   "4lqcsa4mjgp94mqf4h4m7fj54l5g2d4nkg8e4pgpoc4nlg3a4ngevl4o3cuu4o7hua4qqq6f4qdpq94o9g3a4ogg2x4olg2s",
   "4nia6x4plitl4pmif64siso34pgh5b4q2heq4pih674s4q9t4pxh6g4rzp2s4s1p2c4pedey4pddeo4pgdei4nuevw4qsdvt",
   "4tbpv34qpgfi4tbpv34sck5t4r5g9e4rsfum4rthhm4u4o3n4s4g7r4s7g7w4sag7l4nv4n84v8rg44oc4m14t1fwj4tjgyd",
   "4r17bz4vtq9r4uriah4ro6g54uqhfo4uzij94u7cus4uldlp4xbqb04updn84xkq9y4xqqa44t16yg4w0eto4w3eza4y7qax",
   "4ygqdd4wfhii4yvqak4ywqap4xl9s14z3qak4zaq9q4zfqaq4ziqb34zpqb54zuqav4zvqbt4zvqbb4zxqb84zzqan4y6hys",
   "503qbq507q9u508qa24xzfxx4y4gjg4y1gh54yphgc4xibhg4yyhls4zhf794xl9s14yfch751gqa051iq9s502f774yyfdy",
   "4zbe6h507hks505gqw4zqe4850je994zvcsd50mgir513h2z519hjb50ycwb513h2z528hg551wex450yakv5047k953ci8j",
   "4yg4p852fh5u52tdq352fak352haku52haku53kdp054che354chea54fhez54ghfo54jgum53zdov53kapg54ucv3553h6a",
   "55gehc586qc155udq855odqe581o9u591qd659bqbb55wauv57agbl581fkh57bbjj57ibsb576aki5aiph45g2wii57ibsb",
   "58lefz597gw358qdjj5cqsa75abivj5a1b9v59jb125aee575audu35b9eye5c2h0059m7xs5byf9m5cbgzc5cfe3n5bxctq",
   "5cvgqw5cidxy5dcg145dhg155c9ars5cibre5djd0h5dheva5f3aqy5dqdxb5djd0h5fbetn5diayr5drayd5dray35fegzo",
   "5f0dti5edayh5ehawt5etb065ewaxv5fgayl5fweby5hbl5w5fqd3l5f3ast5f9awc5geeti5fhaum5g3e755h0ebu5g0arq",
   "5gsebb5h7eca5gnde75gbawu5hth2d5gzcqd5gnawr5hke9g5hfdgd5hkeal5h9dis5gzavq5iaew65hgbqh5i6ea85hdawe",
   "5j2hqm5j2hqn5gv96h5igcml5i6evl5ivdno5ivdhj5iydgf5jrh245k2h1x5inahx5kegtv5k9fav5jddnw5kegq15kxh1x",
   "5jzc0r5kjdkt5k3ax65k5ayw5loh215l3ecs5m8ike5n9mvg5ju8k05nlg2a5nkmr35l9atv5l9atv5mrded5mddm65mkech",
   "5n5h6j5mkech5nbh6t5qjsj35mgg115ndh6e5n7g725m392k5ngh675n2g5i5nih6p5mue9u5nth7f5nedvb5mue9u5pcmif",
   "5m392k5oaecn5oacw85nmans5pmepz5rdje75nn61d5saex35u6ohx5m43nz5spg8d5t0gqa60fvpq5syg775saex35ufgab",
   "5op4ct5v2k535uggde5sy93d5unga95uqgae5uxfyh5v3fy45v1dwx5v7dwd5tj8i65uwalt64kw755wodmw5w79iy602lpo",
   "5xve5n5u84so62xs9g5yeaws5xq8ra5xy87v5yj93u643sj561wmmj60aflg62xp9u5yf7j866au6m671ugr5ww4si629g4s",
   "62cg4v60c7hh640hk8658n2x63jfri6379bi5zo4h163j9bw68xrwi68do5k63n76h67bg8e68ajq9665drk67bek75xs2mt",
   "67hdsf65j7gs65k76k67bg8f67cg8d64p4ty67k8f56dss8p66m5f46l4x246asbfh6avbfb68w6ry67w5fv6cufga69w6pc",
   "6cbbo56dgfd06h5nd56docav6fbi606fiiyf6bg6ga7kcz8s6ius1t6d56sd6fieff6j7pds6e66vq6hoihc6hoihc6iahv0",
   "6ek6ue6jklwj6jslwn6fz7yt6bv3wy6i98zs6fu5fy6tjwdj6kqetw6jmeuk6kmeuq6kqeuo6l2eun6i070g6j18ck6lzhum",
   "6rquyw6jy99v6jy99v6kg9vo6vkwnh6js6ls6npfza6nph9x6npfza6le7oh6r7p1x6phgyp6ma70f6smqr86piehb6pdehu",
   "6ot9kf6rlhxt6rmi4r6roi4s6rpi676s2jix6qkcno6qpcin6swi436rsgu96pj8fq6ov6zt6s4fqp6pp8fz6shh2y6sigzd",
   "6sjgzk6p46zl6sngzb6ssgxc6ver1y6svgzr6suh3w6swi436thh4i6uth256tsh526twh5y6u3h5a6umga86wflzn6tf999",
   "6si72v6wihdb6uth256wzhyy6wsh036wyhd16w0fae70ks3b6xehc76wsh036xvh0t6xuh216qo3mr6xje7w6ykdvb6zzg3w",
   "705jgw705jgu704hw270mga071chff71ghmz70selo721dwv6w14ui72mi4g73dgxp6xw4rd73pgwn73ygak75clth744gay",
   "6yk49k74oetq6xs3vs6yk49k758hir758hkz76hm6n75bgz075ihl173m9pg75vh1i73s9p876fhl777nk6p78gkmo79zqqg",
   "77ggwx77pgop77rgqh75i91x72p4u578rhg478mi1t75565f72e41a7b6ms47b6ms473i48g79sh0r7aghh478xblu77q8fq",
   "7angu77b3hdm7b2he87bahdm7bbher7bmexi7a8b7n77k61g77rgqh7cwibt7d6inj7dvdvw76w44q7drh2i76z44i77n4cn",
   "77r4ae78646d7fbh1r7f9h0y7eac0u78j4137bl61v78y41r7ct7bt7ba5ei7gijnb7l1skd7gvhwk7fkexx79k40479w449",
   "7h1hwh7ay4m57ay4m97gedxd7gohvv7b74l87hmhy47hfgfe7hdfry7at44i7hifsx7l7rwb7hgfru7hqgg57b044r7hjfrw",
   "7i8hbv7hleu27c74m57bv49q7co4nw7c748v7cw4kw7bq4e17cl45y7jmed97jmed77jqhc97jhh5c7jshc97cn45s7hzcsn",
   "7cx4627lgmr47do4ke7d045v7dg4d17lmmq87cs41e7jygco7kahbx7cw3wt7dq4cx7dd45h7keh1z7m8mr87iqa9j7f24p0",
   "7ez4pd7l9ibb7f54pv7et4gm7gk5le7ed3ye7et44b7fb4cm7g04pf7fj4be7h15c97f74377ge4q77gb4jv7f83ww7gt4pp",
   "7e83557papek7msg657nqe3u7p5ed17g244d7h84sw7mxfmi7gv48g7h84g87jk4u27o7hby7g33mb7ruset7h73ys7mqaej",
   "7ho4377p5ed17ht41f7kg5rs7ozge97sirje7ozgem7nsblx7ij42s7r7mtp7mw8347iy46m7k44s07jz4ei7rolaw7oyahw",
   "7jw4347l24q27puc577q0c5e7kf3xp7le4jg7k83vj7lh4jq7t7lc47lu4po7slj1f7ln4jp7slez17mn4ra7l33xl7o961z",
   "7lw47q7n04r57r2alw7lx44e7mi4dz7m644r7nn50l7svev17lz3ur7mo45p7mm44a7n149w7mg3uv7nj4b77ng49w7ms3nb",
   "74v1777ol4jn7upfvh7or4ja7n63vt7ot4ia7of47e7op3re7qm4qj7pv48x7up9zo7qg4g07t26iq7qe48b7qd48b7qj46a",
   "803pv97qw47z7se4y77rl48z7rc3ue7tb4rp7si4967tf4h47t648u7ua4wn7uc4qp7v557j7uk4iv7tv46d7uh4ic7tv44y",
   "7uj4j77tv44i81ljc57tz44l7ua44g7tk3wm7zubkk7u344h7u94527w04rv85brap7wd4rm7vl47d81md8k7wi4qi82bfp7",
   "82cfp87ue3l181kaub7xg50a82hook7wa43u7x64j8851nuo7xs4id7x142h7y14f47z95e87yf4b97yi4oa7xn44s83rd3f",
   "7yk4jl84bet787ap2c85bhhs7mggjo7yu45j7zi4nv87up657yi43c7xw3qy7zq4mw7yr44a7z54777z742f80a4me80i4n7",
   "7zg41j7zu43z81f4wi878gxr81k4ua80j43f87ugbo80v43r81g4f185d8nk8aaouk8224rp8284rp81m4ev81s4ep8204ek",
   "8294f681a40g81b40d82g4k982t4q384a57m8283yw81r3i184f4pi84r4py86458x8574qw84l4b084340p85i4oi8d3mei",
   "84x48d8bjf6r85k4i17zn2gd8bnf6884y41685240j8eoott8jvvvi85o48d8b2apx8c1dlz85v48m86348i86246h86n4i9",
   "85w41586748d8634128644168dlh1x8774ik8dsh298drgx78drh1487w4r48cmdc68dwgtg8dnh458dzgy286z47b86x468",
   "8g1oeb86v40786k3up8fpm8r8cybu88elhrc8774ik8d3btj8dwefq87j4668br89j8ghn5x89j5cz8by89e8esgnn86r3mh",
   "88548v89b4mf89u4pg89n4jj89641s8a84lu8di7td8dk7t189w45w89j3u38b44hu82c2128lnt5p8b44gn8aw45g8ah40e",
   "8hcefh8aa3sb8ar3yv8bw4gg8c64ic8jwjtf8jhhjq8jjhmm8bb3nn8kvm0z8di4m78cf40c8e44sk8di4hl8cc3sw8dt4hi",
   "8d241l8e04ma8dz4he8d33zj8di41x8d83vy8lmjqk8ei4hi8eu4lo8ek47r8ed3zh8ei45s8mjkks8e23ya8eb3ym8ec42j",
   "8kxbzf8ez44g8ei3sq8fh41m8fw4im8mqfze8f343m8ex3v68f83y28f83yu8fb3z28g045z8kfb748i14mi8o2jr88noi01",
   "8fw3yb8fy3yt8nwi0y8o3i0k8gw47e8gu46h8ofi248gk3yb8nbdll8h643m8gj3v28o4en68hn42h8hp41u8ho41r8hs42k",
   "8i044a8jo5518i041w8i441q8i542d8i742e8lu6w68iw4b28p3eh98ocb5e8iv4428j845l8jn47r8jy4bs8kc4jb8k24b3",
   "8lu5fy8ka4cf8t3oid8jy45o8nr7ky8k443p8ji3qe8od7ot8lw4m78rpdop8kw3ve8lk45w8ly4ag8szgib8m33su8uei2y",
   "8mv41m8nl4e28s87vs8oj4ar8p04id8ow4698xpke18rj59j8pe3pc8q03zi8sk4xp8y3dze8rt43r92brz08s844m944tiw",
   "910mnw8t64j78yxco38w660j8sc3rj8ss3s38u84ii8to43n8tw43q8vd4tz911d9k8uu4a392nk3791ofvp92qj5z8iv1kr",
   "8uy3ti9gsxo58w74cy8yw66a936g1x8w74368wp47390u7uo8y34px8xv4jp8yp4wk8y24b38xu45s96pmth8y949x8ye4cb",
   "8w534n90g597972lqb8z24ap99zsc28zm4et96agrc986mv897kksj96sgpx8z33ut90349t8y73el98gm4q98pm3i9174mo",
   "9154gb92i58w978dnf98nixx92g4y398kgqg99pgr999whau99xgr69axj3a93f430995b6f9ayi7o90x31z97k7hx9drpyy",
   "95o4za9cekk79d4lj09aydn095i4kw9cji7594a3bj9bz99m9c699b9f6j769492wu9dze9l99i5hq9eecna9eqdq49kcsdq",
   "97r38d9ad46c9goeaj9grean99n3p09bo4cj9irgjk9jddkz9jicjx9m8lv99ldh2b9j291q9i86hf9i96hr9m5dfk9oqkio",
   "9nxg2n9nzg2k9nddlk9j553w9j950b9jb5029in4hv9p8h139ji4zr9qflce9k550h9qpjd69rtj0c9rmj039sqizl9tvp1s",
   "9kl47q9uqqyd9qmbqs9sqizl9tfk149tbj0x9tsk2b9v5n9d9n947s9uggze9v6jo89v9j2ma3cv1h9w9jj89ulb1ca6iwuh",
   "9r754va70ww99yjk6c9y9hpe9z9jqy9zoi889ynd13a0vjz8a1jkdpa30ne6a0sbi4auvyvja2yixaa3kip1a2ldaza2fcia",
   "a95u62a6kopoa6kopwb6jz5fa70ooua7goofa7loola4cch0a7hq7ra66i9ha5aecva89omza8noo7a6whdca5eduka9soox",
   "a9top1a9vooqa9wopda6wcnfa6ycndaa3opea6ncnia7semba3z598a83asraapgl0bb4z53aali3baapgl0aeor3jadollj",
   "a7r558ad2gk4a7z54sagrr1iaeggkcaci9tsag0h2sagwk24ag9gesarix2cakbs48ahqgg0ahqgg0ahif9daihilwan5s46",
   "anes5fanfs3nakfgbsalqi7iakfc9dapds4walpfqjakc9l4aq8rq0aqjs13aobngaaqms1aapjp17asfs1sao5fzsb6dy19",
   "ar7qw3ap0gutapilr7as2s19aqam4caqdm4kapbfvkat8rflaphfd0aqghu6awguxwakr4irarqga4atwkgbau6fwgatsd6v",
   "av2fy3auocv1axakqzaxakqzaxxmo5ax9ekrayofcraxyevdaykfcwayud0cb7nvu6b0pghnb25mezb81vucb02dmfb10fxb",
   "awz5j4b4jmr8b51nwbb51nwbb5yorib3jfcib6gorlb5ymm4b4gg2gb6oorkb6porfb3jchsazz5dxb3jchsb47dt6b4ndsn",
   "b7mormb7sor5b82pdjb80orhb86orsb86ormb88orjb89m6kb93oszb7rjf0b6ikpzb79fnmb17477b99mwbb8vhygb8xhyg",
   "b8hf7gb9pjxhbf6v4bbfev4dbb0n6ibamlnobarlnzbihwbzbagek8bdjokbbd5lnmbcxjpjbbyfdpbbwewqbf9p1qbe4kbl",
   "b975jsbezlkrbgbprxbgkmbbbeldvlbexf3qbfef84bilpuhbghf0vbkzsgobeu8h1bhfeozblgsgxbhqeqobmpsm4bite6p",
   "bkgjunbdd455bltobvbmpsm4bjmf1dbjof1wbipbntbjqecwbsqwlpber43dber43dbo7pt0bo8pswbpssx7bm1d89bm4d2c",
   "bomndwbosnejbmqaenbopcj7botck7brjl9ubq3dqnburt3kbvat3xbwatcbbsujwtbx7u2ibwttc1bwwtc4bxitc2bxstc5",
   "bxptd4bmr3pubt5cpmby9t9sby9tc3buxiw3byptcsbyutc8bw1tchby7skkby7sklbx3pzhbsyaakbexf3qbvlegibxgmr7",
   "bximr4bvod5dbw3cf7bympk2bx5jhuby5n15byin12c1ltb6bwmbzkbzdneybymjlhbzknelc0dpyrbz7hvec0ipyubyrjlt",
   "c1ztdzbzpmzvbyzjhyc1ps5abynf4nbwa7jec0kmh9bzwj4dc3pspjc01fugc1gl53c1rjpkc0qe6uc1zjwac21jvmc2tmof",
   "c26jvrc2kl5tc31m1cbyb5ulc2ifjbc6ms85c77s84c4hcdcc7ytjxc5mljhcdiwprc7cptxc53fpqc6ajlmc4hcdcc6opu6",
   "c71lkbc75lkac78lkbc98oshc6dc0ucbmt4tca4n1hca5n1acbxr74ca9iq5c9kffocbin9scd7rt8ca5fexcbop91cjiwsp",
   "cctm9rcb1ahbc9585qccdgulch3tk6cm4wsvcmdwojchfs02cfum6hcg4mozcg5i5dch4m6qch9maccham3ocfecibchwm73",
   "choixjcidm85cijm7ocgndmxchumemcgwcwecgqbvfcghakucj8m68cj9m6jch2c1tcjaltu2jh04sciqg7sckhmuxckon5b",
   "ckgmidcjafc4citar8cjbbxwcm2lpwcmpm2ecktgzzckyh07cl3h0mcl6h0ccl2c3jckubelcm2g8vcmjhvqcxpxlscofn6z",
   "co4lh3cokn6bcoxmancoplgfcqzmatcr1mapcszmifcvasjjcmz4dkcvkskdcv2skfcu2nwocvesk6cw1sk2cukne7cvrnp0",
   "cqk5s0cu2erqcvyn06cugfd5cu2deld2jwlfcv4hhncw0hmocw3h6kcwbi53cxsnqocxqmzmcxvmzzcydmz8cykn5fcycly0",
   "cyklxycvy9v6cxjc0dd0cmphd6jwlhd6fwlld6fwlld0clxmd7awtid7lwsjcylb1nd7kwqfd14lxrd27pfzd3as1hcxo6z4",
   "d76wkud0oh6bd1olxud1eizucz58r6d9cwoxd2glxhd2ekuud3qoxyd8zw25d3jkcqekbh9dddgxofd8au1kde2xn6d73srw",
   "d4rjxgd34bgvd2b900d2d8k5d5ekivd4zez4d4mb8od6fkird5fe50d8tqxud7mlsxd8gpcbd5r7esd4y88pd5l9mhd8fltc",
   "d8hltbd8bf53davsq1dagried91lsvd91k9mdaeo68daeo68dc7s9gda7kd1dbfoomddfrtyde1tqvddirttddlrtwddorto",
   "ddwrtmdbdhh9ddbpwodfasevdfas9odfas9kdd0hdxd9ngzxddihehde2hd2de8hdhde9hdkdh7sr5dechdxde7hc6df4pvj",
   "deeheadelhhjdehhdxdejhbtdelhcndhut52dfolggdhkqzddfmil1dc565ndpbxm7dfuim8dfbd2cdgyj9bdi8p58dh8k89",
   "dh2h0pdgwh9adi8imvdixp5hdiyk7wdmgtzidejhbtdjjk7sdjciqsdk1ld8djxjnrdu3xu4dgwh9adkqldedken6qdi98t6",
   "dllmdqdlmme5dngscjdnhschdkylnhdotu3fdmfn00dm7lowdm7lngdnep2pdmslosducxaldmulnudn8n35dmzlnhdn5lo1",
   "dofn2gdmoe6ldp6qcadq4srpdmwe6udmze6wdprpive3txb0dorloqdqxs30do5ewedphmaddoviofdpxnz0dr6s2vdshu09",
   "drhs34dqmomhdrls2qdoxd9xdqrjfndrmlqmdrbjeodt1qzodrnjfvdt6p06dt8p0ddthozgdsbf1bduoq0tdubnzydt3d5y",
   "dvqq6ldu8khkdzevu9dq54ewdviny1dvklxtdvjlindt79ijdx4ovwdwflindwhlixdx1o6ldwqljmdxnqeedxsqecdyqsi3",
   "dx2lzjdx1lsjdx2lsgdx5m1fe0butjdx9m0idxam08dsu50zdxfm0he1vwd9dwkeqjdxxlzedxzlzbe13uumdwpd9ue1luun",
   "dxgh1sdwfaoadycl8me1luundx4cmxdug42kdzdosudz5n95dzgoqxdzhoq3dzeorxdzmorzdzkoq9dzqoqwdzsoqydztoqz",
   "dzzos9e01oqpdy3dj1dud44sdykepce0npv2e0koqae0sp2ne1us70dw25dwe0gls9e1mq12dyraebdzpf2be05ep2e05ep0",
   "dzg9w9e0vh0fe0gep8e2xq16e2zq1fe3nru9e1bfm9e3urule46rvde2nimqe3wowhe4eq7me39ifde4fncre39fwve3uj6r",
   "e36dd8e1w7s2e1a6c5e34fwwe39fwve74th3e53kaee55kabe58kage58ka9e58kabe4pgnne57ig1e58if1e4ufo3e8muhx",
   "e5bflne5yjl9e4sb6ge5sfose6lmlqe5zdnhe3258ke5pce5e6ifo6e5vf3ee69d1keblviue99nwoe8kjjkeb6thve99mqd",
   "e8sifve8tieve6c6s1e98ituebbo7ze9tf1weaymase99bx8eaymaseawjoseageniel6xxuefbv6re9g7f0ecek13eckk1d",
   "ecnjw8ecnk0se5l2oaedhmc9ed0hhyee6oc9edbk21ecsdtted3dtdef7pjeeeglcoedoepxebv7bkefsokgefjmpuefgle8",
   "efrmmrefsmn1efvmnbeea8m5eg4leieg5lesef3drvefzijvefzijsegkx9hegcjwjegajx8egklepeh8osuegplemehdogm",
   "efxdlceh4lekeeifigeh3je2ehylcvekctrpehphybefvfyoeiakyseidkzfej5p6cehde6heokwlheimkdlemnvpveikipr",
   "emuvpyeitj16ep2wlbekmodael0p8zejzixnejvi2fekwodvejqga2el6oe8elep8hei67xpejfbznekbh9dej5enyeojvkz",
   "elewyzekyg1tekufx8ekwg2semgo7wejt970elbdwkelbk7mercwgeeludqsen4izkeo4mehemwebpenoj53eo5mehen5f4u",
   "en8f4jeojmf1ell72wenvdooen3brfepvqtdei67xpepzqtqenobwueq2qt7eproomeq5qtleqcqtqeqdqszeozgpneqmqtj",
   "er6quxeriqv2eqqofzeqwoxxer5opoeq8h1ueqgi88eqvkjeeq5hfoeqqi4her4kjrer4kk9ervopkeqpgyseqwi4gerfkjw",
   "eqjdngerunpkew4wfueqxe5veq0ge1er6fjyew0vt9esxnuhepq6ppewavxoesqgmveqc5gqes9clies5bg6et9ifietslvy",
   "ettlc2eu0i50ewmtv0eubibdetze9reulcjjev2hqpevglahevcjurekufx8eulcjjev1e9sew0labev1cuxevsiuqev3cc9",
   "f53y21eu9fi4er437rewpld6ewlx68ewyiaaf1jwf8ew4gq6f1qwfmf1zwfaeyjoh2eytnrwey5k34eybk2lez0obnexoe4n",
   "f0st4gezqp2tez2kvtexved4f2zvqveykcm4f1st4vezyklwezkdfnez0bxfezuhfaez7ckoezje3nf06hekez8b5lf11mha",
   "ezncc0f0ghemf08e2mf0qhebf0thelf1al5jf03botf0ie2ff3uu0wf22mxwf2dojhf0mbo0f1gheff43u0rf0mbo0f3kq5f",
   "f0l71jf3oo8jf3ykq2f28bnxf2tcrnf3ngpdf5irgaf3ldudf40cb7f295z2f4qggff63o7wf5kikyf6holsf66kvhf4ub5m",
   "f66kvhf3ngpdf6ci0hf60e5lf5wc0hf7iodef5serwf5ferxf7ilopf7ejztf7rln9f6c9wvf6iflufb9kh4f9tr6uf584iw",
   "f88c6qf8dflwf93fn7f8jeoaf8eeo3f93gayf92fhefdzwudf95fihfa2dtqff7wohfcds3kf3d1wzfc3pqbfc5pq2fc8prn",
   "fbkkj7fbqlenffwwvafbfimjfajbo6fcgpr3fcipqbfcjprnfclpqbfc6mjpfcppqafdotc1fc6ioafceionfd5nx3feru1o",
   "fcuioyfemrblfe2dvchoiztgfd4cgmfdzwudfd8c84fdre6yfexm82fejeuafg6q80fgcqaefgdqa5fhltn2fjnwu2fggqa8",
   "ffwmc5febje4fg1mdhfhrthffgamd6fgamd6fh6ragfh6ragfglmdmffwwvaf8f1ttfgynj7fd1xkafhxr3yffo6eyfgreej",
   "ffv8pufihqlqfhmcnrfi6nkafirqlefjmtdwfixqlhfhqcu4filn3mfp7xysfg25gsfpgxypfj6lxhfkuteofptxynfjjms8",
   "fl7k6wfjnwu2fkdpprfldtelfk4mbafkblz6fjfb5afjjb26fmntmofl4lz9fl6lz0fj87nlfl2i0gfldkihfoavd2flznls",
   "fjrdjofminlrfminlrfo5u95fn5pxgfo2tg0fmllfkfm2dn3flvbi4fmae9sfnqhh4fmya18folnp8fo1irsflt6g4fozmkh",
   "fnqb09fnwa0efqdn7wfuywr3fpmkjgfqenwcfnv5v5fp297wfpxav9fq0avnftcv0afq7avpfq492hfq7962fqb96bft3t7s",
   "fs0nrbftzuy6fquaxofr0axnfqyayefsdmz2freaxffsmnoyfrgavlft2nj7frsanhfs1a0eftnnpafsga0bfv9k8mfthfh0",
   "fspb12ft5djffs38qzfwqtq2fu9cibfwqtq2fvbmbvfwstplfuqaxofvrejlfwipgdfw1grifw86csfwnpgqfthfh0fthfgf",
   "ftwfgrfxhs0ufwrkjhfwzku1fx9mdjfw8bj0fxblmkfxvphofwlckffxgkj3fwochsfwqcigfwychvfywsp7fx2chsfxcchj",
   "fxpcxpfxicgofxlck7fxvchbfxychvfxj9oafz9qc4fznrh9fyzfo4fyzfo4fzpn2bfxk69yfzfhykfzlj0rfzzmtgfzxjuy",
   "g47xd0fyw769g05d8hg0fju4fzvasjg1dpgnfzmd7rg09cg0g1mizwg1xkqzg1yhxcg23hxag2aj0bg0fju4g5kwo4g36mzf",
   "g36keag3akz2g2iaq9g6gwkfg3hjcog3yo57g3kkc9g3umh2g4ut6wg2raq7g1adbmg3sjcng3xkteg37apug5yun7g3ufr1",
   "g41frag4ejbhg4nmeyg7nwhgg5lid1fvm99fg5xkr0g63kd3g63cy8g6dlgdg7gkixg4n60yg7mki8g78qmxg6bg0fg6pj7j",
   "g6ykspg629zwg72kilg7enpxg7loxxg7lpcfg6ld41g7gkixg7dizhg7eizzg7gizrgaajpog7mki8g7aboyg82kudg9yv5m",
   "g7kcyug9mv58g8volgg8xoljg47xd0gadt2tg8jl8rg9pnozg9bj5ug9effigcjwqkg9afktg8rl8xgaks7dgb2u9xgaztoq",
   "g9belagaps78g9effig9tkokga8ojwga5nlegajqqqgamqr3g9xjp0ga9nmega6kseg95ejug9vfidga6fipga4j61galokv",
   "gaajpogajlp2gabjnqgacjutgacjutgazol8ga5eljgbapbngavk12gasiragdcu99gb8jm9gbcml4gb7k3xgb7jpmgcgtf8",
   "gbajg0gbuos5gbpliigbpk1igd5tebgax8z0gb7lcsgd7suzgbmbexg79dtwgcxng4gctfpvgcbdn3gd2lgvgd2lgggcnesl",
   "gdclivgeftf8gdaelagdclivgdfljhgdtjjegdpcrsgd7dsbghkx1dgenjy8gf2jy9gfsq6tgfaf51ggvtwggh8ub0gfne2m",
   "ggalfaggclf3gglmufggbjusggejudghir82gh1f0aggbjusghighoggq8olgh4caygfoe2ngi1kyugidnsmgiplimgj9tj9",
   "giaks3ghxjvegijkfkgivk3mgjbnjkgj2ir6gj5iq4ghm5xlgole3tgjjkvbgkvt8sgjox1fgkilligh1f0agj6614gkvnle",
   "gkpeqpgkwk7rgl3lmkgkpeqpglyiyrgldnrzgl2ddsglnnlugledcmglme8sgm6nn8go4wihgn2tayf3ngpdgln5q5gogee8",
   "gn8hzqgo0m0mgktx0tgnwk9zgole3tgo9jfngolnpegole3tgole37gpttg1go9jfngn868vgofakdgq1nblgpqiysgpznp0",
   "gpmfy5gsfx43gq8nqfgqcp7cgppfwggqype0gruu9ogsdecbgr7pe5gqtfbngqyk56gqcp7cgrvsodgrlnr4gqsmcngrnnql",
   "grmnqigrqnqcgqvmd1gsdt4ugqzahqgrunpigrokeigrokeigs4nqlgtowkpgsane4grkahngp1dzugp1dzugs6j60grqaid",
   "gsxp38gsvningsdecbgra5y7gs6amigszniwfc6mjpgse5q7gudrnkgtlet3gst5r2gtyiqbgsu5qmgsz5qugurrnvgt35r5",
   "gtycndgt95q9gvbt04gunm2sgvpu51gtp5ubgunf6kgv0lg9gv6kkagwmt52gvwrhmgvlkyggv8d95gvolgagvxlmegwaqbg",
   "gw0j0tgw8lhegvm5qxgxriwsgx4llpgwnb8ggx8llygxalmogy2nbpgyltr9gxriwsgyfnbngyrtllgyjr5dgybmoggyckyb",
   "gy2crugypmozgzftjugwh2r9gygbfqh07vg4gz1km9gyzji5h0htk0h02lo5h08kljh09kpuh0hne4h09ilch0ysmth02lo5",
   "h0eipth0gg73h0hg73h0efxzh0lfy5h05gdnh1glowh10inah11in0h22ttbh1ailph1eik8h09ilch1km17h1hikth2apz3",
   "h21m1hh2cm52h27muxh2epjwh29muth3rvvrh2mlbgh3asrnh3jsl0h3lppnh3elkah37g9nh3af8fh3ehs1h3mfjgh3zinx",
   "h49pr3h40k9nh3vf88h4yuosh4wtjlh4cmseh5au3fh4jg1hh4pcnhh5tteqh5jqpth52frsh5ore7h5nnknh1mgujh529cl",
   "h5uldeh6xvbfh6stdih6hlemh7giv5h6zlg0h78nwhh6zg60h7dn4rh7ptpmh7cldth7kjvqh7dfczh80p2zh8dp45h7vfqr",
   "h7ym5ph8dp45h7660bh8op3ph8jmtgh97g86h89gb6h93fovh94jush8sapzh96fovh9lhcsh9lhckha0mjxh8hfs8ha1npo",
   "hajnmphapno6haef5jhajip4haebxshbcsm2hb0i5whb4i5shcqg3uhcyg2ahb9g07hd1g2ghcbudlhc1relhcbf82hbymw0",
   "hcgsmhhcvg31hcski3hctg14hdjsywhd8f6mhedw3uhe5wouhe2szmhe8swkhe2n0mheltztheir21he0aephedmcehedmlo",
   "hfzmejhfymeghbawvihg1melhebaefhg3me7hg4mdxhbawxbhg4me9hg4meahewpa5hf4suwhfctokheumbhhf8sypfx9mdj",
   "hf2mljhfoucnhevg13hf8lkshfdmthhem5oghfjldihfjlkghfzrkthg7tx8hh7g4ohg1mjdhgekf7hgog7dhgmfvehghhbu",
   "heifhihgj7uuhgzfvshhgt95hh6n9shhfrawhh5agahhkn9fhhln9dhhrodqhhom39hhsodwhgcg2thhtljihhqg4khhoj0p",
   "hi1odihitt8nhi4tq0hihu25hi7odqhi8mxthi5l2chi7l2ghi9ljnhialjwhi9lk5hitt8nhinm2ghiplk4hjqlkahiomhj",
   "hj5tz6hiwkalhj5rjdhj1myphj6pb4hjbmylhjimykhjmm0qhjpk26hjrgrohjwk2ihjvk2rhjym29hjzk1zhk1f85hkhsk0",
   "hk6k1whkbnaphkclrohkolaphl4sjihkbnaphkzffahl6mjmhl5k15hlaltghlou0uhl5en2hlklz8hlttl7hljk5nhllm0j",
   "hlnlzshlnlzmhljjl2hlmm07hlplzyhm1t4ohltopahjzk1zhn1in9hn1t6dhlxlzuhk6k1whm1lb7hmeg5ihm0oo5hltopa",
   "hmdlwmhmog4xhmelw2hmclyihmklzthmllx5hmljozhmqlvmhmeg5ihmog4xhmylvohmylvzhn7k5xhnds1fhnkomdhn8kr4",
   "hn7lydhn2jpqhn9lybhmwjtyhnjrhyhnoon2ho5vvjhnqomrhnxomchni6q0ho4m4uhnlm2tho4ceyhoelythodemnhott6y",
   "hp1t7bhqewuyhp9o2khp8ft2hpsrqphpytvshq6tvwhq2rqghq3p03hqct7shr2nanhq9nejhkkxh2hqen82hq6ahvhqbc57",
   "hq6g1yhqpronhqkhs6hqwkfqhr48cohr0m9lhqgmzjhr2nanhrlt2jhrijbahqhgz5hrst10hrpsd4hra6kahrmm03hr3mzf",
   "hs0t0khs4s14hrxc8lhs4s14hs8mdlhsbmelhajnmphsmrqihsjm77hslplphs4seehszrq2hsuld0ht0ldbht6ohaht4cma",
   "htgm4jhtkqtnhqewuyhtim74htnpeahsdfpqhtnm3ghtsn8ohtxu4uhu0m7chu0m5ehu9m6uhucrkkhucrkrhubmochubh78",
   "hugsgqhucm6chukdd7humdvxhume33hv4to8hv6gg5hri6v6hvhvv5hv7f7dhvhtp5hvennhhuyftrhx2oejhvogfihvxke6",
   "hvne7qhvxfl5hw2nzyhw6t2ahw2kedhw4flehwbu3shwdjclhwit2shwku3rhwfhgehwit2shwie0rhwut0whwrmruhw2nzy",
   "hx1rnzhx2oejhxmn1ehxonkphxpn1ohxut3ahxsogthxusoahxvn1qhxvogehxzogihy0kuxhy1n1yhy5t39hy5n0hhy6n11",
   "hybrgshy7mn1hy7mmhhyankqhydn0vhyahkqhydn0vhygnmzhyfn1dhysrg9hyln0phymk05hyoqsehyrl8hhyun0ahynni7",
   "hywnhnhytn29i12ktjhz2o2yhz5n0lhz4n1lhz7mzxhyoebwhz9pk3hzhs6whzke5ahyrl8hi02jmwi0dhs2i0hoe0i0im0j",
   "i0jefji1cvv4i0get6i1budni19kohi1pe85i1pe80i1wlkbi1zufdi2im16i25iv6i29hygi2gie8i2gie8i2krq6i2kllp",
   "i2mlr0i2meq4i2uqwmi1w5csi2vly1i2wtkti3mm1oi3km28i3pm1oi3gipji3sm2yi3mm2fi3mm1oi3oodni3pidai3slos",
   "i3pm1oi3rm2ii3sk65i3msimi3pm2bi3sm2yi3u4jdi3tm1ii40idni42m29i46iexi43m1hi46icvi4bk4ai4dhiui4enec",
   "i44uvxi4ok4ti4qk4ei4qm8qi4us2ji4ym1ri51cp1i50s3vi52m3zi4xm27i54m3zi59m3fi5am3ri5bf3ei5bm44i5frhu",
   "i5gpdei5hm4ci5hm4ci5jrwzi5kn40i5rsjii605r0i5znmui60c1qi63c1oi4bk4ai62vfki66qlki6dlpfi6cqm2i6g9yi",
   "i6folki6hf5vi6gkvqi6vijdi70qmii73qmei7ck2qi7ovwpi75v0ti6folki7dikqi7ck2qi7av18i7rl88i7lxczi7pvr4",
   "i80g6xi80g6xi7xnuzi84nuli7ywzai89nu2i88qsti8dnzhi8dqtfi8kqqii44icyi46icvi8ttrpi8ksmci8nqi8i8zrah",
   "i91pz5i9anaai93lpii94p6bi9itnsi9io2vi9ipvpi9kl7fi93lpii9itnsi9plt3i9rpw7i9zs3hia2m19i9tx83iauqqw",
   "iaetjpiapmtoiayp8eiawkn2iazkndiayljuiayp8eib2kn2ib3nu3ib0ntzibenueib1t8gib4nuaib7ntvibanu0ibdg61",
   "ibff73ibik68ibli9cibrjeoibjskwibrjeoibyqqmic75geic1np9icpky0ic5s5bicqfhdicfkonicdpbricgjfuicfkza",
   "icikmuicrswlicvtx7id2nonid6j5sicyt79iddtzbid9kfpid8foligchscidlon0idqm4qidgur8idrklridyjx0ie3ks3",
   "idwnoyidrv73ie1nmvie3ks3ie2msnie3p9jiebja3iebkmoie9rf1ie7rmjiet9c2ielrkrieev8uierkntifpjc6iexjhq",
   "iezfj8ietrekiexopcie3p9jiezopmifg6xyif5rhoif5rhjiffjiwifgiqiifgjfsif1vw4ifhl2bif9uojifjlb0ifog0c",
   "ig7jbwifrr4gifog0cifrpk7ifvnx6ig6jfqig6jgdig2rhcig7j4bifpw5rigcnmuigoj40igmnynigykvsih2iygiguv6g",
   "ih7j58ih2rgkihgj2pihgj7wihgj5xihkkz4ihqfjzihnj63ihqfjzihqj3vihskk5ihtj21ihuj7bihuj3cihltchihto2f",
   "ihyj2gihvnx7ihwnivii4jjdii2j2gii4nutiidfo0iihfo3iicj2siidj44iibnv1ii7tm9iilfo6iinnvaiiqj4liilr9a",
   "iiyiqsiiqtm9iiax2nij5ix3ij3locij6kavij2nmsijcjbwijbjc1ijekx5ijikasijjj2rik7iwvijjkx3ijqiw7ik0bax",
   "ijvkjqijvkk2ijwjt4ijro0jijzjffik7nuaik7ntuikal3vikekcyikanz8ikhjuzikgjv6ikfo7gikgjn0ijkx2bikok3y",
   "ikml5wikfl6iikql6iiktj1siktk4gikvj7piktl5ail0l5wil0fhkikzk9uikcx8fikiv62il1j7hil2jhtikqtosil5lvv",
   "iln6diik7nuail8j7sil8lceilijf6ilajesilaje2il9liaijkx2bil4recilihcoilihb7ilp5mjilklc6ilmkfvilok8r",
   "ilmjk1ilmkfvio8htoiltjpgillrr7ilntodilsoayilxjuwim2e8rilsto6il5wznilsto6im1jgoimbjgxim5kfpiktk4g",
   "im5pvjimfjhlimgkc9in73gvimsa1qimkkksiminpmimsj5cimpkyaimsizgimql4dimuk04illrr7imvlmzimwlakimoswf",
   "in5i44im1x3sin5kk8in7kj5in1r4xin9k3aimsuziimsr63inanifincln4in8opjinel4tindlnrinik4xin5opbincopa",
   "indopeinjkmeinlggoinnggpinil8iinlkl7inwkisinonkoioaihyinujsxinvjrvinyisjinwkisinto8sio0joqio4jl0",
   "io6jx0io8htoio9l0cioaihyiocl3biohgu0iogj6ciohjvtioikjoiognkfiognkfioqgd6iopk7ziopj93ioqkghiotj8v",
   "iowgceiovjmpioxkm5ioxkgoithi0tiozklnipl5z9ip4kgiiomuykip9jyliq5kmxipr9ciipgjvxipbks5ipeks2ipgnq2",
   "ipdqtgipnlf0iptjunipvkcmipxjauipzhm1ipvmkaip3bzaiq3ippiq2knciq4ksnipwqz0iq5kmxiqfdd7iqx51iiqfjmq",
   "iqgjlsiqkjjeiqkjljiqkkt5iqjjqziqojkbiqojl4iqtjlliqukooiqxktaiqtng5ir0kgwir1kq6ir9kgrirakprireiuk",
   "iquut0ir6k5lirmjswiq0fo3irhqc8irrkh7irzge0irsjo6irslcnirkqbtirvkaoirwjm5is1i4fis9n5kis9ntsisiisb",
   "isekbpisildcisva04is8tlcisskvtisvlc5iswk8git2ghjisiisdisykomiw2a0nit2j5wittof1ismuuhisxtalitjusc",
   "isuv9litgnxxitsl93ittkwxithi0titwjkjiu6jqbiuggiwitjusciubju2iufl17iujfleiuho1ziunjjfiuqij3iupk9i",
   "itlm1biufq9qiuukm5iuwjakiuxigqiupp3qiuxjn0iv0ifrivcs5siv8inxiv4ln2ivdl3yivohyeivcs5sivtj80iw2ilu",
   "iv4updivyh8oivets6ivwkwdivttsfivzkfziw2kgaiw3kieiwja41iwek93iw4nayiw7ndqiw9nesiwaneciwdnlbiunjjf",
   "iwjlv4iw1n64iwlndziwtkaciwqn73iwesudiwwk92iwxk8xix5kmrix7jg6ix9kudiw6wukixy99xixyawaiy29w4ixtivg",
   "izaj7aixrjwsixykd3iy1j2niyaianiydi1biyaoowiyhkmeiyensciyniv3iyqij4iywjcqixowu6izjcngizaj7aizehw6",
   "izpgxij00fobizwl25izyk19j07gu8j06jodj0fi8mj0cimgj0p9tkj0kgz1j0u9szj0ogxtj00ubkj0vkdrj13kdkj14k14",
   "j225efiqojkbj1akquj1ejgnj1cn7uj1dn7ij1hn7pj229vdj10s2tj1eq8aj1kp0gj1skl6j1ukbuj2d9unj1zjj9j4lim0",
   "j1pq95j26glaj1toiij26gltj2ahq9j2aisij1xoiaj2ahzej2dkvdj2fkuxj2elzlj2kijcj2mkacj2ikadj2lkngj2okgg",
   "j2tkerj2zhvdj30ie8j2gt11j3r9nej2lsyyj37kbdj1kwvtj3bkb6j3w9uqj3cla1j30tsjj3hhvyj3kkmij39q7bj3kofl",
   "j3pofwj46fzej41kp6j43k8kj4q9u2j40pf9j4bfykj4lim0j4lim0j4nhwoj2ikadj4zhw5j4bsz3j4rnfaj58gl3j5n9nq",
   "j51neuj5gg9oj4zsy3j5ko58j699omj8qh30j6ra33j68fo7j6q9bzj6jfzjj6y9p0j6khgdj6hlw5j60swmj6op2jj70iv7",
   "j6zkr3j75ho2j7fhc0j75nfzj6gw8gj7fk72j6ssvhj7y9qkj7rgu8j7kjp3j85g9mj88fpuj8aioej84nfoj8eg6fj7wqdt",
   "j8hgylj8x9qsj7ks8dj8qfs4j929q2j8pl16j7wp2ej8mn3dj8zj28j9afc2j8znkbj9ig3yj9jg3vj9igxyj95omqj9nh62",
   "j9bngqjaefc0j9yfcpj9tf4tj9en3lj9pf59j9vf4sj9fnhijal9rujat9rqj9xgpyj94skija0k6kja3iyzj9xns9j9tq82",
   "j9totxja1nr9jaggbgj9vf4sj9wrj8jamfwqjb19pzjb39sdjabnhfjaqkezjaln5ljb0fbeja3wbrj94wkojbk9gujackr8",
   "jb5hrdjb2k9gjc95xfjblex0jbkfxrjbhl63jbsg5qjbtfwfjbug5rjbnk8ujc4elkjbtg5cjbxiw4jbufxajcia22jbzg3d",
   "jbzg3cjc7g3ajc1i94jc5ifmjc9g9sjbtpd4jcegobjbsg5rjclg8tjbsg5qjchjxwjcog9xjcyfw4jd5fhijd5fhljd6fvl",
   "jc4890jd3gmmjcpnewjcungkjcwnevjdefy7jd9jlzjdkfi0jd8nscjdofh7jdkjm2jdljm2jdfnhdjdfnhdjdqikujd6rb0",
   "jd6sm8je9fl7je0jnbje9fl7jdvnlgjelc3ljdyni5je8iuzjddij3jddij0jf79n2jf79myjeygmwjduto2jg650ajelnjr",
   "jevnl5jf5gamjetneajfbf98jeune3jfdfuijfpf9djeynhijfhf9mjf2mc4jf2nfojf2nlqjfof93jfqe28jfvcjijg0a1p",
   "jhm3tpjessgijgb8qwjftfg8jf5rnqjg5fdyjfonhzjftnisjftnp1jfunhxjg8h9xjgcfdtjg8ibcjg1p9vjgnfddjgannc",
   "jgena1jgjnldjgjnmnji262tjgqniojgxnj9jhefcqjhfezpjflw1gjh5nmfjh5nd2jh6nmhjh5oyzjhkf68jhrf6zjhbnlf",
   "jhenm7jhiku1jhcnldjh8pgmjhgnkyjhdpeqjhknlajhmnl7jhlnlhjhnnlajhonkxjhsnkyjieexyjibgs1jiegs0ji6khv",
   "jhznndji2nlijhynluji4nlfjiigmnji2nlijilf2ejikgs9ji4nlfjilh2ujipfbcji2ndnji0pfsji9nldjiann1jihno3",
   "jitfb5jianlajivf7ljilii0jhyrfvjiwf3ijj9bt9jiwhzsjjdbtrjilnl1jiqnmqjitnlnjju9g1jg8ibcjiunk3jjfntq",
   "jjknt4jinpgnjjch39jjvnumjiurfzjjoh3ljj6nk7jjvfq2jjbnkrjjanv1jjenkhjk0f07jjxgghjjpniwjjsnlmjkqgds",
   "jkhnlxjlo9pujkqnltjkds35jlkfp7jkynltjl1kvijlvbw7jmd8k1jkos9hjltfxkjmi8jwjltgw1jlwggxjldnm7jlgnmx",
   "jmx83ujmy9a5jmtaxkjmggesjlvnt0jn29asjmmgp8jmhntojnkahdjk4x2wjnhc1rjmjp19jmpnihjn8ge9jn4omvjn8njo",
   "jn8njojmhntojnaqcejmvt9ijogccrjnont8jn2spnjoed9jjockq6jotd75jo8npjjk4x2wjmzsqijncsqcjp2gzvjpr83k",
   "jnht4pjp2loljoymymjq9c9sjpygn7jpwfvrjpmnnwjq2ewajpeqc2jpkp1hjp7sdvjqx9dnjqcgx5jqdgy1jqcigwjq7kbr",
   "jqtdbnjqtdbnjqqgfljqli66jqwep3jpds4rjqlic1jqtns4jqlsp5jrlpbrjpsqqwjrxnxdjrupetjsle5bjqbufnl9vn3k",
   "jrps0njt7eu9jtl9dpjsgmkzjsxin1jsdp98jt5h4sjswmthjtmenajtqe3gjtgiy1jtekipjswr8lju6e39jt0qt3jtnlmt",
   "jthod0jut9eoju1j7njuefe3jtdreujuiep9junerwju4nk6ju4pbgjt3w4njvcep9jv9h5wjvieojjvjet5jveh62ju7s91",
   "jv3o52jvzd7bjwm5zojvveq0jx45bejw6eqgjw8ep2jwjcbgjweepxjw5ikqjwpcccjw1nxnjwtljfjxaeo8jw9qeljwlo6u",
   "jwto7fjx7kicjxajkhjxkj7gjyacmrjykawpjylaxgjz48f2jxro7vjynfybjymfyyjz1dsijynfybjzafhpjyrjl4jzafhp",
   "jzff14jyloakjz7jkdjzkfg9jzlfgvjzvcinjzofgkjzejoojz8np8k0m99djz5px1k09dmuk0ad41k0w994k0ddvlk0bfhh",
   "jzpo1uk1399ck16998jzvmlljzoq2rk0pf6mk0khjik05om8k0wfi7k09ommk17fe3k0wjsok1lciik1sao9k0gqm7k19i2g",
   "k1nfcwk0wjsnk1appgk2zbj5k0stj1k2nfenk2nfenk1rpqvk0stj1k3nbj4k2pksfk2nne9k2nnnvk34ja0k3mfjmk535b3",
   "k4aagok3ufvak2vqm7k4dbxsk3mjxwk4fbxlk3eob9k4x9e9k3rksmk40fyhk3ko73k41ktgk4eh6lk4sdruk56c17k4dkqw",
   "k4ektck6j66wk638i6k5qb85k4dp9xk4jpa2k4jpack2mw3ok4qqnik5zfj9k5pif4k5zignk5jp6qk6vc35k60ldhk72c2r",
   "k74c2rk5up79k7q5aqk7v87tk6koemk70lk0k7gilhk7jj76k8bbd5k8ik79k68sjtk6ht3hk7sk9zk7foemk7tkjik9z5t8",
   "k7drc1k8ueenk8fkchk8elerk7lrbgk8ik79k8ik75k8hkctk8hkcxk8jkbpk8kkckk8ild5k8qknsk9mcdbk93hnmk96ho0",
   "k91kolk92kfnk8uo84kacb1hkc74szk9llmkk9qk8nk9shn6kapbcpk8wrfsk90rgbka7hodkaahntk96rc0k9noyrkajhzs",
   "k8csm6kathnrkb0g8qk8ntolk92ui2kcd8dbkb0ks0kb8jgokbgjgrkbjjfmkbshsjkbnjggkd7itrkbjqdgkdmbaxkaxujf",
   "kcplkkkayujxkgu8tukedbb4kdgkrlkdgkqykczoxrkdnjankc0saqkdkks8kdvia5kd5oyekcnrkzkdzkqgke8illkejgat",
   "kdpoxokfr816kefjbekfbc0zkfw9fikd9sblketjh2kecp48kf0gbikffijykempo2kgu8tukfnis2kfritjkg9ef8kfsjry",
   "kfvl6zkeis8wkfonhekggiwpkhybo7khofp8kfltf6kghrnlkhwi61khzi5zkhho74kibd88ki9j0jke3x09khynohkjgc0m",
   "ki5pdekkq8d6kimprbkk0f87km95f1kjziuokjjo0wkjznoakjxp4pkk5nywkk6nyqkk5p4hkkenzokjit4tkjkt4ukknnz1",
   "knx5f0kl3o0hkj0vj8kon664km0if6knt7q4kmenyckpv529kmnqatkmsqcbkoobx2kowbt8ko7l95kmst23kgsxw3knoqrq",
   "knrqrvkprbwxkre60dkpgisgknsr7ykpybwbkozpnskr1bvukp5pkckqagjzkry7rbkobu6zkr6evjkqti0hkq1pzvkqvoq2",
   "kqspzvknlw2fkuk4p3kuk5mjkwlj03krjoqokrmor2krbq9tkrooq5kqcu1dkn2xd5kswgsdkrtpnkkrrpwxksvhk4ktmcav",
   "ksyigqktpcb0kt2if5ksxle6kuz8apktmhrzktnik9ksyqnckt5pxqku4j1hkumgewkq4wj3ktapkaksatz0kusghdkqzwsg",
   "kuthpnktqpwzktzop4kusj1mktwpkrku1q2mku4pkzkuap85ku4q21ku4q26kueq2fkvhj2ekwebxjkumq1zl053x6kw3izw",
   "kv5potkveq9gkwij1ukwlj03ky297pkwshy7kxya05kv1sv6kwzgwmkuru4vkw4q3bkvatqekxfj1tkxrj7wkx9ntzkvrtwf",
   "kwnrg3kx6pk4kw1ty5kx9pisl0n62zkyfj92kxdqdakyejaxktax8ckyjj9nkylj7pkz3f64kwity4kw4q3bkxyrakkzhhcw",
   "l0hc83kypphnkysphgkx9ntzl12b7ll18bdykzloydl0khffkzrp8wkygtynkzvpmwl10i0ml12jjgl0bps6l0rptxl309q3",
   "l1ljwbl0tq74l1sjsckxiwq1ky4uzcl1vjzhkx9w5fl1zjvyl20jlvl22jjbl3ab7dl3mf2rl1joril0nt16l2jjv9l2njvt",
   "l0qrosl33gsal33gskl34gswl37gsil0ptv5l2tjvel3bgszl2coi2l32jw0l3mgtal3bjwxl3fjwkl3fjx7l1sr9fl2qoy9",
   "l2woxql49g22l1zt5ul32p0yl36p06l3fjx7l28susl2kru1l28sv6l29suql2dsvekuzxn6l2nsv0l4akvjl2qsujl4hkdh",
   "l2wsval2wsuxl4ikmjl6q8bxl3csv2l3isvfl5kjvcl6dbzvl5tgwcl4xnpfl5ugwjl5xgwqlb9jq9l5wj7el41svnl68gwo",
   "l49sz7l4jsqcl4pt5bl7cgs4l50sw4l7chnql5dv4yl5qs57l61s57l7ojsbl9e9c2l64t07l6ht00l6ot0ql8rjm3l79bc4",
   "lat8s6l8zlibl9vj9tl9jlx7lacgzolb6bvdlb5cktlahhrnl9hps0l9zn50l9qp6kl98rpilb4i95l8mu2xl8mu2xlb1l62",
   "lbaknslbxhcwlc0hdblb8mxdlbem2slc9eeilbsjq5lbfo65lbum2zlcajj5lbdpv1lec8dklbkp54lcfm63lcxji4lb5s2i",
   "ldvivqlddl11lden2alcmpa7le3kutlcitjyld0pa3lepjnple0p8tlgm9bllf2k6dlf7k5tlejp2glfxgillfsjn3lerpwe",
   "lfvjeslfyjhtlfvjmwldfu02lewpx1lg4jiflg9jj4lfcpbblfepbclgcjigl8sxpwlg7n0zlgsjh4lgmkkrlh1j38lh6jem",
   "lgnn99lhcjejlgxe67liic5glglpaqlh6jemlhbmyjli2isqlfntqzli6k1wli7jeslhcjejlhejedlibisblhdp0zlhfp0n",
   "lihisolcxji4lhlp12lhnp87limjdqliuinbliwj8nliyinjlj3ioqliwj8nliep1cljhp1glj5mp1linpxsljikn9lk6hx7",
   "lhutcfljxkmxljzks7ljap1xljap1xljhp1glkbkqrlljc9gln371glkvn93lltenllk8pf9lm0enblk8q2allhjbcllgkxe",
   "lkmq28lk3s3llkqq2plm9hcvlmmfd8lp062nlhiwbflkzqcsllfoyvllymx7lloolxlum2bmllpoz7llqoyzllpoz0llxpai",
   "lqr5uwlohhjploliyklhiwbflp2jnblnlrpnlofonelnxsbelocpzolquc1tlpqk9xlplll1lpgn63lovq91lnwtbdly4hx4",
   "loqr88lqogsylponhclqpinilq3mmzlqpinalpwo2ylimy0vlqdnrilqbo06ltf95ylrekdvlrljgdlqmp3blrjkdilriksy",
   "lriksylrxj71m06hxxlrxj71lr6o8qlr1p9slrsksklrep2blronu3m0uhxpls0n2jlqurx9lsrj90lw26oclukeomludf2q",
   "lt7jm5ltuk3olrctw6lu2iw1ltgjz7lw18t1loxvxslteoc0lsdrzpluhj3altep9dltirw3lusn3dlswtl0lvnj2klw6hzw",
   "lw5jnrlvarqflverqclw9pb3lwnnzclwgpatlvesw7lzn8zvlvyrqxlxxighly4hx4lyhiojlwkrpslzncoxlxnpbalx9qd5",
   "lwwqc4lxjpovlyuo3clxcrpilzaj2mlz1m3nlyyo36lygq3alzuhutlyuo3clxrsb8lygq3alyyo36lzcm0blzglzxlqqxrt",
   "m06hxxlydrbsm356hgm0zei6lysrbym0nioym0uhxplyps5vlz0rc1lz1rbzlz2rc5lz5rc6m0vifqm2neb7m0eospm26ejs",
   "m1xg74lzwqjqm05qk0m0lpq6m2ihxhm4ndtqm2bnqtm36k8nm2wlrxm3kibjm28qd9m3zic3m5afm7m52fmzm4odtfm5zeap",
   "m4jf7lm4gie2m3xkfbm4lmdsm8073mm5khyem3gsohm4qpqum4sprem4tpqum4vpr7m6tf12m70e6mm6ckqem6jkowm6ylp7",
   "m88dxam7ukhom83khxmc77gsm9sj0umbudpym8mrh3maxhhsmbfjl3mbxisimb1nyvmahq4bmb9nylmccipsmckipimd3ilc",
   "ma6tsmmd3lq7mayt6gmcynsdmf1ejumeckdemc4sexmcuqiemc4sexmh29limdqqi1mbysepmeyo1omfujnnmgwe5amgjhs5",
   "mhhentmebry0meprvomhheobmerrxsmfvnzrmn13ihmjm7m6mief7wmigf7smijf7ymferxlmfhrxbmi0idmme8us3mcnwmj",
   "misf60mkgefcmifibomiugibmj2ic9mj8ibsmigemsmi3es4mhqerimh3rypmcnwmjmgtsrymh3ss8mlx74cmmz6vnmllbdw",
   "md3lq7mnxt3fmjpn6xmiprzymkfmnzmjorkpmlpi8smfzwc3msp3ffmllbdwmk6rrwmhkws0mm8kiymmwif4mmxibrmlxnwf",
   "mnxiefmmem7pmoqaqgmrm52cmnfibrmnuibkmnqj9xmnxiefmo6f33mofib4mo7kkkmo9kkhmnbpwjmp1iihmp1isomomlos",
   "moqlx3mpyframoulwzmnxqj0mqcfqhmngt44mrqebamqmilzmqui3tmnut5hmnst59mqui3tmqui3dmnxt3fmr3i3lmrufpc",
   "mtkadimp3sy7mqbsi7mqlswfmtlh0imuef59mqtteemvjf31mnqulgmx58vbmvnf2rmtuodemvkfzdmthq8vmv9i8bmttq93",
   "mtyq9jmy2ehcmwmfp8mufewnmu8qe3msjtymmugqegmuhqekmxodsqmyfd6hmvkqermvlqfwmvjqg1muys2dmyrd6pmypiez",
   "mvvt3pmwbt9kmwbt9kmx2t2xmscx2rmzhm6fn0aipbmsix2rn0uhhfmyvqdfn1efdqn1hfd6n1egivmzhr6bn1gjjkn1ojji",
   "n1rj0in14qcfn14qcfn1uo8vn6p73en33kjjn777v5n5glm4n5iqc0n5jqc2n8kjiin64rq0n6crq0n7eql3n7gql6n90kli",
   "n9phfmnet4mmn4avquna6jhpnaijgunagjgnn8rqjznamjgmn8sql0ndx7v9n9kqjknboison78uyanadq33nccl01ndgizp",
   "nd3l1end5l1fndpj0gndhkclndvkeqndcnqbnfneoineoj4sndro67newlbknc4tb7nfuj70ncntc4neapybnpg2v5nhybw0",
   "nddtafngnkfqne2tainh0lelni8ga2nh5ocnnhzmalnf4tvnniilfbnk7fcpnox5r8njdl5ong4tvmngttvcnkhjncnkmkug",
   "nhotv6nngafynhztm5nm4k23njety8nnnihenmrmxcnlxq7tnm1q82no7lkonplf8ynoalkrnoqjnwnqoca8nsx6penquc4f",
   "np0nq7noznpznqhlt1nrclscnw86igntrkefnu2ke3ntnm7xnu2ketnuwi3wnnwwflnutkx4ntlq4nnwdj6pnsaugmnwcne5",
   "nxjj76nxrl6ansyuyunxfmhbnxrl6vny1l98ny2l9fnttuzeo2z5wwo18b3anzam5ho1clvdo1skijo1ollao6u773o2qm6v",
   "o41hkqo37lfto32m6eo42iruo42irgo2fpgzo47ljfo40ljro45ljko47ljfo4jljyo4ilkno4mljuo1clvdo4nljnnxrw4y",
   "o52jmao4vljuo4gmsbo4pm3wo50lmqo53ljxo53lmso4zllco50lmqo40q4wo64gpyo5amaoo5nlneo5rlyeo6ijlgo4pm3w",
   "o6nkrzo6ukseobv75mnvwxsro6xpsao8zi53o1xw2zoboar5o96lc8oa6kunoa9msjoa4ndhoa4nduoawkuao41vxkobpifo",
   "obojz1odxb5jobwku4ocvljuobcnvfobcnwaogz6evo9nthqobfoluoaishoo73vzaoconmiofcdeko5xwhyoa2u94odbnb7",
   "od0p0soe0lw4oe1lw2of7i62on83k5oe2nmqoe6oe4oevp53ofgoz4ogxjhcofmozaofpp0yofxp00ofzp0mocyungog8p0s",
   "oh9ktrogkp18om07lzoh1p13ohdpf2ojnhjkohqpk7ohupjyol8cp0oi5pk5ofludyomt9vaohatlhojbp9wohatlhohatlh",
   "ojkplkohmtitojppsbolakcuoi9tbvop0864oczuzvoiwt6zokrpl1q2eq7xooxa8aoivv2soktq66ol1pg9ojjt0looicsm",
   "omjq6tomoq6fomlq6ooodmtgooolx3on9q3ioyk3cloth7gyosd9y6omyryuonjro8ove5vjon8t2looxpvjoooqjaooxq6o",
   "opiok8opjokiopmokhouc8dtoun8dbopspwrov481nos8m1bouo96voovtwuotafe0ojyhp3oqsq5uoqtq69oqzq4ioovtwu",
   "orlp0eow88vdorpp0qoriq3vot4lyqoqmt3pp1j44josfq42otzp2gouzmb3osgtjhp0389nositxaoswtoroadtr8p0d9br",
   "p1788xowyp8mowwpszoy4p7poy7p75ovzthwozjp7mp3q8i9p08mr3p32ue9p0fmr6p5k8lhp1jpaip04tq1p2rpd6p8j795",
   "pdh3hdp42mrcp1btk1p32pylp1gtk9ozlv7hpa0679p8g91xotexn0p6jhlzp5rjt2p6ihy0pbi65mpip92hp2subcp7hj9g",
   "p7jj8sp32ue9paf9r5p79n8qp6ari6p9oix5pcr9mvp30w4jp98mprparivkpc3dkbp44w5lp3qw4kp6kufgp93qjppbpiha",
   "p96r30pe0a3vpb7mnzp79ufup4uw5sp8wt3wp7iulfp5qw2kpfx91dpg58t9otayi9otfyijph67gipfgh6hpdbpasphlakq",
   "pegpxfpb9u3ppip92hpaouqqpevnlfpgutf3pf2nkbpfknkipfrnkhpj3bz7pgcmlhpjya1ypg6nkjpgvnkkpgznlcph3nl3",
   "pkdcqvphfnzlpe0uncpiomlwpiqmlvpirmloph4rg3pjrjbzpm8aeipipnypphirzfpm1d1ppgktshpgotsbpmndgipfovov",
   "pfzvpapiutskpiutscpkru7ipr6compr9coopkxu2fppvis1pl9uekpl9uekpmkuhopxb5fppppqgupudakvpmjvrjpv3c3v",
   "py865ypovu58poxu5epstmobpuoff1pp6u74proqbvprqqggprbrnzptemnjptimn7pwzcdepq3ukupwla45pqruleptnq1w",
   "puzm29pyl9evptzqr8pmwx2xpy7d8vq0p7ndpunqq9q3b4zxpuuqqipw6nvppl9xq4pvkqqcpzaeaoq0ras2pzlbytpwnqri",
   "q21aaxpvuthcpxeq62prdwgkpxfqmkq12e2zpxkq7kpxlqhipvvtgwpvvtgppzxlbypyjqbupz7p7mpyuqc6pzap7mq4y8bd",
   "q13l4yq44aaiq3lcq9q38efqq49b5rpz0sitpy3uctq41c0xpytu4dqaq4l9q2eq7xq40nvlq2gufmq6zgzgq4npjvq6hkb4",
   "q8fd8xq33te7q6mnatq6snamq3qtsrqd9bhfq8fl8oq4strhq4vtriq9nj98q9jl99qd1a6pq6ku03q75tdgqd9bhfqb6jet",
   "q78ti5q7zsjlq7ktibqeo91wqbela3q7mu0oq7ytrpql641kq95twmq9ctxeq5vw7vqfuaztqim79kqkg5ntqaotx8qi7alz",
   "qgrd7uqfuhcmql25nwqhobcmqibbjrqghlrlqmh5uoqgxlrxqeys5iqdtu5pqe0u5uq8ox52qimkiwq9kwvhqlxazhqlwbj0",
   "qjmmqfqgctqqqeivmpqenvlyqn6b9fqevvm0qf7vmtqelvzwqocbozqmfimtqlan3jqlin3zqlon2iqmqlmlqlan3jqond0t",
   "qlkpcyqf5wf1qi6uj0qj4u38qpjaxdrk20x4qpiepcqq0dxeqr7al8qo6m5hqm4rmeqqnb1aqqcdzxqnip43qnop44qlcspi",
   "qletczqoslpqqrmbyhqp6m61qrsb2vqmgt52qs1axkqkavinqklvamqqam5sqn7t5lqqkm5hqhywt1qmcudqql8viqqn8u6g",
   "qtncx5qpcsa2qrmli9qrmli9qtwdjmqluviuqluvinqlnvixqndtg8qoetgkquhb1hqunc65qm2visqpss8bqpjstvqv0bwq",
   "qtjiu0qsnmm4qzk59lqsmmw9qspoaiqtcnyoqtfnyuqqfufzqr1u0nqv2loaqr0ub0r2j4ppqrcub7qxde7bqvdlnyqz695a",
   "qs6tw6qs6tw6qvtlo6qwelo1qwgloar3t4x2qqiw11qwhon3qs0v3tqzwd29qzveicqqtwejqzhj99qv7u5vqv7u5vqvduj1",
   "qzmmz4r2gdelqxos58qvruj7r1og7hqzrnrur30c1er32cf8qw8uisr38bzrr3bd4gqzcr6dr1vk7hr3pd40r1lly1r4cbzl",
   "r4yaqor42d4mr3tdi2qzbt8ur3bd4gqwjuutr3hhxvqxkuzjr4pe14quvwonr4cghdr5jcg4r78999qzou9sqypvbqr6md00",
   "rb158tr6ndc9r4nn1or5elptr59lpgr59lpgr83c36r04vbmr8dctgr8hebor71lirr8zchtrja2omr9abnbr8yd6fr4qrdj",
   "r9henkr4it93raub85r85lh8rapcd4r6bsg9rcee6nrbhdoarcabmura0ktgr9rm8wrawjdcrcydkcraokzvr9vo81rammaa",
   "ratmajrendwrrbama8rbbma9rb3n4rr9yrzcre8dkmrgs7k2rb5pxcrcam7urchlrjriw58krf8e1lrfde0yrcom7nr8vua8",
   "rcomgfr93u85rfde0yrfteo4ra4u8hr81vtare5mzdre5mzdrakuagrexn0brgmebhrg9fjureqezwrd8qnirb1u9lrb8u9c",
   "rbbu9kraokzvrgxf8lrekp7rrhzekvrmm5cmrgpknirfxmg4rcnu9hriperkrh1mqbrkmcmvrbnvo7rbpvo4rhrmqorlbbxe",
   "rkiflxrm3d0xrkel50rk5mp1rn5dcxrtc5carohfldrmkni8rojjaurs9bj3rovkyprjvvbnrs9bj3rrucwfrrwfdarpcouz",
   "rq2mkwrsqdazrhtwwvrtccz2rtdemfrqppz0rtjejyrn2uztru4fx3rmxvlmrlwwbirw7behs463cirlqwmwrv2gtdrwrd7w",
   "rtqot8rujmksrummpvrv5mkyrv5mkyrusoeuru7q0crwwgctrv2o56rvaoptrrlvlhrrlvlhrxjmftru8tz6rxpna7rwmql7",
   "s4l5jgrypn2prxpq0ertvve3ru9vf6rrlvlhru6vfdrzrmgos2wbjirzoh1cs20gr9s824yrrzzpzvs04q0zrxntxfs0mp9a",
   "rvdw3rrvdw3rrzat4ms1joyvs1joyvs4sg4fs2gq2ms03tv7s4qn3os7acwksau6jas5hoges2wu4ps69r52s6lr3ys9pgyi",
   "sa0gqusf65d7sdu78ise1797sa7k2as9ind8s84rj4sbsg9bs9oosis65vcjsdkbwksd4e0psdldgjsjc4s0skt4a6sc8ols",
   "sir6g5slb50rshmao9sf4k33sjr786sjiamdsjjamhsgwg7gsjqalwsot47usfiqm5sersh3snk5k6soj4wosikhwksor4wx",
   "sk2eagsj8kbmsp15q5sirnr5skdhwrsheroxsj8nussqs588sjjq5esrc5ltsduwjxsncgsusmqidosijttzsncgsusrs605",
   "ss96l9ssa7vdsp1iupspuixvsmkt55suh6qkso9s2gss3i7fsvl7vasn2usbsn2usbspgs6pss0o3xu9draissfpjmsww9yi",
   "syj5wesyr5wfsyt5w2sv5hgisvniyyswneqxsx2htat4s587srs605sylhoiswyo1bt2k6ufsymjb3t3k60ksx4r7bt5y4vk",
   "sylhoisrtwojswku2zt6570csx1uslt2oiawt0tpjyt0vqmjt2xmfet79a7st5qipat1du88t84cv7t3nsq3tb26tgt6fn10",
   "t6usvht9jm1vta5k0etagjuftf3ahmtfe9jhtd4j4xtli3vgti0bt2tl869otfkr9ztmv6xiticngmtkffxotioncntlncbi",
   "tfnuh5tlkf63tj6q1ctk8mm8tlzgmstmhf1ftkvmnrtlbt7ztjqutbtmcs3rtq0m8qtrajkwtoftzbtrwmmbtp6tz7tpftvt",
   "tqtrsitt0nvqtv3fhitv7fgnttukc8tuelr7tumllmtvrkf8ty1bmytvjnuvtwikfku2k4ycu0v8l3twuogwtwzo1ju2i6s5",
   "u5n9yku35714u388ccu0licftznmjlu5374iu656q0tzdt84u1mopdu2pk92u3gi37u7x5s3u6l8bqu816pzu4mhaeu5hdm5",
   "u5cg6wu3jqtxu9g71ku8x8bou0nv8tu968ccu5ep5luf93uhu6im7xu6tpndubw8rnugi3ttugr3tvuci93eu9elduuhk3tt",
   "u9sphcuarnapua7p5zu9draiuarnapubglzxufk7fvuawpo5uh077iugh91eudnkjguf9llquir8couero42uews1qug9o4l",
   "uixfjruj1fj0uly7wvujfhhiuk4jaaum199pulde4uujmn5cuk5m0qul8jaeummd1dumnd1fuow8leukwq5luhovcfuo7e9y",
   "ulkpp8um9qhvup0hduul7to2uoqjmaurp8i7ush95nv3k200upnn57uqwhk8ushbu0uu0cwluuxblqutshleutdjzeutkjzg",
   "uu1hlbutpjz3uucfq5v1x39yuuajh6uusjhbuyi7ktuwccxzuyw7kkuv9mfxusdu4ruv0nnmuwrh2qv0k750v44490uykjed",
   "uz4h07uveu13v15bi3v357buuvmuykv0zlbouxiv7yuxiv7yuy0v5hv3nin3v3viiov3iki3v4biilv7uaefv6fi33v5do4a",
   "v6gi2mv6li2bv6li3ov6oi25v6mi3hv6pi2nv6ti2yv7pgbtv7mjjqvay88tv8gj76v8zjz9vawgtjv9zod5vb7gufvb7guf",
   "vb9gumvbcguvv9foekvbjgtyvc4fhqvfl7mlvf297bvg47mjv4kfs1veveabvgd89vve8k3nvcpr1pvhy6vyvderhpvepocj",
   "vcicwlvh1fh0vfho8vvevr3evf0qxcvjhce6vjtcdzvhdqwlvj1hylvld86zvinlk6vln86dvjsff8vjcl8jvmx7hmviiswp",
   "vlrfq6vm7fj5vjnrgxvo391cvl7nz9vp38kbvn2ka6vokcwmvomcwhvoocwxvnsd48vs7570vs7570vqn850vjgvmtvnjqao",
   "vp0l9mvnorkjvocqg3vn9loyvsp855vs4dwivois6avvu4ccvqnl0wvqol12vrpddfvr7l2pvrpoquvvm8k0vrqr4gvtyjrt",
   "vww8bsvuekpqvuokq3vtuqhyvvdiwgvvgikevwthu1vuur99vz48acvvnp8gvzvg8rvypnaew11mm7w91ncdvzktibw1xlqe",
   "w4h9iaw1ps5ww6m5zww5b9inw6p86rw34r9xw3xpapw857g2w61glmw5mku3w3yrlnw5wkfqw7aho5w9e9dsw60rl0w9k9da",
   "w8ifpaw8pjc4waea9yw5ruktw90ihdw8zkflwbc96pw91ncdwa9ihxw8drfawe657wwbbli2wb6jbdw9fsbiwd49u4wc1hx8",
   "wc4hu2weu737wcqao3wamroqwcxr6xwf7kk2wt71ozwj757vwi79hqwlu2z7wicdd4wh7jsgwhmjrwwhsj99whvdi6wi2dij",
   "wjjfvfwkd7gkwk791iwjpgnpwjsb3zwjzb61wjpgnpwk7kihwk7kihwjkqkgwlacxhwkfnsewn78bdwnk8buwnn8p2wm4gp1",
   "wmeh9xwn8g8fwrp3xlwpa7vxwqc5uvwqd5vmwlcsxbwlksqqwkpv80wpib0cwoufd3wokk1qwm0v8ewq2felwqsb0wwqrfn3",
   "wpemfjwq4ki3wnjurawt16vwwt16vwwmnv5kwq0nzowtg8ckwu08f9wsmilpwssim4wsxio2wszinrwrdry8wvk7v9wulc54",
   "wv5c6qwvtb1cwwk83gwv4il6wx9cxhwxqfojwwskpnwubuiqwxaikzwzp9c7wzfbmgwwri9twziep4x0i9blx0hd2nx1x7ng",
   "x2j8gkx1bgwvx0xfcgx1ubmjx1vblsx1wblnwytsylx1xblox0mljpx26aubx4c56vx23dw2x1khlvx1ohk6x24e7sx2edu5",
   "x2ndwlx0zp0kx2hbftx35dxpx2yi44x2tk8mx6652nx6554xx2qk5sx36kizx36kj5x5c7z5x2oq7mx4qhvbx7n524x6g801",
   "x5wbqwx62br8x62brmx68bsfx7q6ifx54lcux57lcqx7kc6ux4mraoyo6nmvx5qgdrx6ck1nx8c8kex88cfrx7qi3oxbc49n",
   "x73o9sx96eo1xbu513xaddeqxa5bvyx9sif5x95q7bxagn67xbucrqx9ft2vxadpqsxanpqmxcnc4gxctel2xb9r2cxe38tv",
   "xe88twxb6tgcxb6tgcxdakroxdbkrnxdtmi4xdjgzmxdupgexe9lugxe4pgkxdnrz9xetlalxdosv9xfyevwxfxd95xf8q3l",
   "xih6z3xghq41xifeufxiod2bxhjnvmxkcdnhxkuew3xkcdnhxkch6bxkocbxxksc7jxkch6bxi3tlyxl5bizxjlp9pxk0p9z",
   "xk8p8pxllh6oxlxb9exn4brcxn7fd7xlfohaxlkoh1xm3lbfxlrp8mxlsp83xlvohlxltp7txnkbrrxpj5ysxoiayzxntl89",
   "xmttkaxnbq29xpplhsxprd14xpsd15xp2nthxpxdk5xpfhf8xqfawlxpllfgxpnlcuxplo23xqodtzxsxcx5xp9sghxp9sgh",
   "xs2afnxrrf5uxseafrxrwf76xrjehgxt6f6cxseo6vxsko71xt0kcbxtycjtxui9taxv3fevxuxfxfxv6di3xupj43xv4j5v",
   "xw0cs2xw7csfxvzoykxwcm2bxwaosexwdosjxwgosmxwgosfxwumboxy3ajxxx7lttxxbltuxx5ovgxx7ovuxwxowfxxrk3t",
   "y0d4pdxx9ppjxxdovsxxomrcxxhovyxy3ajxxxlow0xxnow9xxpovhxxsovsxy0mr9xxzovqxz7dgsxyep3lxysotbxznh62",
   "xyvp3vxznk7sxzyk7ey0kkdqy14dn1y0qkegy1bh3zxzrth8y20kdiy0bu98y36amky1uo53y26o18y524z4y4cd9gy38itv",
   "y22bzly3gjqoy30ossy3zhyty4ne0cy40k5my44iq9y4za4qy3sovby52k7my5gfssy57k85y5pin4y5fk65y5wm7sy6kiq8",
   "y70djcy71fmxy6tq1py6mtmjy94e1zy9dammy8nkb7y8rkapy8xkbky91kc8y9akbsy9bkcby99kb9y9bkb0y9khovyandvm",
   "yahgvzy94sfoy9ypf0yb5i7vybii85ybji8nybeg59ycx8xiyboi88ybsi88ybtiaoycwa4xybokioyckgomyc0ofcyed59e",
   "ycfm1iydja2gyd4m1pye79gzydkkn6ydvkndydfm1vye5gwfyg24zqyeyaleycwu5vydznylyf8aj3yelis9ydntf3yfl9sa",
   "yfjft5yegp9syfgjp8yflhsgyeftzsyfrjrbyfwn8dyg8kmkyg3n8dygjhrhyg4n87yg6n89ygdkv0yfmsv0ygdnufygpp5r",
   "yf1givyhil3yyi5ffsyi5fflyhgptkyhjpteyiefw7yi2l72yhoptuyiqfezyimjoyyiqjckyjagq8yj0l9zyimjgkyjya33",
   "yiwo11yjcicmyiwjclyjkigayjml46yki9tzyjol72yjpl70yjtl6xyjvneryk8l3zykplbjykyjrwymq7z7ylidf2yn3im0",
   "ylko15ylom0hylrm0kymo9doym8imgymgiikymgkgqympiicynae0fyn3im0yn8ipiyodaqtynhotkynlotiyo6nmvyp1i6r",
   "yosmlkyoooh3ypagt1ypmevlypoi6jyq3d4jyq2keqyqt9bbyq5lmvyqyd45yrcjikyrgk7ayrgjinyrbdnhyrnjihyrmkvk",
   "yrxkq5ysjhkgysxcaiysnkl6yt4kx6yryu43yt7kqtyt4o83ytxcbtyt7oz5ytjkjaytlm1sytxhkvytwj9iytvk5kyudd8o",
   "yu8hnjyw2df5yu8kspyuehnjyubksyyung5lyucmzayuxk1nyunjsqyushfzyvc9a3yuyhgcyuyhlcyv0hgkyuskpsyutkoo",
   "yv4iwdyuauavyv1mqiyv5l6uyv9iwnyv8k4myv4nnyyvghk5yvzaajyvlhj9yvklslyvon20yvrlt3yvrlsiyvul6rywk9he",
   "yw0lt5yw4hivyvzkiiyw6hiuyw3jcayw3ls7yw7knpywbiwdywdiwkywdjc5ywckn0ywfjgwywphzkywzhj7ywkl64ywsmwd",
   "yx2js4yx3kp2yyolqkyx6lp2ywtdkhywsmwdyxmj4ryxnh1yyxkjh1yxilqoyxwjvxyxukstyv9iwnyyk9ixyy3jh4yy3jvx",
   "yy8h2iyy5jpsyy7jxpyy6lr0yygi1vyz19jvyygjbfyyjh47yy6k9pyyfk25yyojziyxhgm8yyolqkyyplqzyzf9jryz0ghf",
   "yyxjuhyyvlqmyz2i1ryy3jhhyy3jh4yz6gawyz3k9nyzcjo4yzkjwfyzqk1byznjm1yzrjpqyzwi1fyzwi1fyzxjohyzqk1b",
   "z05jmsyztqkjz08jn3z03mudz0djo8z1h5krz0gjogz0cngoz0glg0z0njn5z2akdmz0un6gz17ia3z15ka2z1bjn5z1t9i5",
   "z2r4gwz1jjrzz0pu8pz2bc56z5t1m8z2bk9kz2jk9vz1wq62z2akdmz2miadz2kkebz2kkebz3fc4ez3pfmlz3klcsz3ijxl",
   "z3wkxgz4u6fwz40kskz526f7z4cl1zz4cubgz634e7z43e6rz646ftz5sa5lz5ckubz58nelz6j4y2z5bqi8z63h08z60n0k",
   "z6jg4ez6oh5uz3yhz7z6nhymz6nhymz6nhymz6lkhrz6skh6z6xmpuz75jr7z7ajr4z85621z7bmpfz7mmhfz7wipaz7qohd",
   "z81lgmz86ipfz86kaez9hi0lz9iis3z94rtrz9tipjz9zma5zby76jzbr7nszb6l63zbigvpzbvhqpzbyhgjzbxhgezcgiz2",
   "zde4x5zcmmzlzd0hf4zd2heqzd3hfgzdy6spzdbl7qzdjiz9zdjiylzdoizqzddquzzdjwkdzdxenqze7hf9ze3l26zeamq1",
   "zemaeuzemifizeqifizevi25zfyez5zgan56zg9delzgnnemzgxgp2zgtl6vzh2feozh7fjzzhch3bzhanf8zhxfjhzi0nfc",
   "ziinu5zipdwczjciqxzjfiqtzkb4t4zkg4t7zk2n8vzk7e3yzkinerzlni3pzm2i2bzl7ngnzljn7qzluk5izlxjzizmi9f1",
   "zman6jzmthnvzmzngzzmgvy8zn8c3hznzirczoajdezoanw3zodnw9zqaeohzp3bw8zpnitpzpwiu1zq1dlfzq1eowzqao72",
   "zscfbnzr1vlvzr8eojzrt9urzrsnflzrunfazrunf0zrwnfgzrzm12zs9m0ozsam0szsll8zzsyo96zszkakzt6nr5zuvfa6",
   "ztwnnmzu0jkozu4jkpzu7jmgzuejklzuijldzusi2qzvpmcozvsj6lzvumbfzwji3yzx3ua2zxotcazyku8ozy6k5izy9lat",
   "zy2bhczyqk58zyru08zz36wpzz3iq6zzhm5ezzlo9bzznkyl00cs5c00xj8x017kme017jjs01boab01doad00ee8c037fun",
   "01yil6023kle027io402mb5i03rflp02xl88033m5203gjhu03lm5e03qjh403zoal042j1f04repd038vfj04a5l504ljdt",
   "04mj1g04sdv104xj1l05tfbe05ufbd05fjo206lois05uh9805vnj005zjo8064jon078om3066jo4068jo406bniy06gjoc",
].join( "" );

const AAP_CATALOG_IC = [
   "07mnjk09xffo0awhx00c4lhw0fug3a0h1hce0h0k4a0h5hcs0hrf6b0i9tuz1bptbo0i8hgw0ibjjf0kak3j0p6hzk0pbfdq",
   "0pnij20pqfok0ptfo60ptfeb0q9hyt0qmg6m0rrfge0s5o610s3hx20slfbz0ttfbq0tufb40urhkb0uuhkz0uzkgb0vjhkk",
   "0vlhkl0w2jto0xwk2k0y2ewt0yqexf0ysewz0z8f5y0zfiho0zpf5y110ewx125nxe121i6312cnxi12ong712nf92138gd2",
   "13kidb15hg3k15rfb717kitg19mk4b19phjj1ajjjk1adffi1dckd91djf9i1fqu881ehfbt1ffji11gvkd01hju6j1hhnet",
   "1iurja1iio5q1iagm81icgm01j9o7h1izi0d1j7gn91jfgn71meiyb1ncitg1ohk601peh371pvewy1pxetx1pyet61pzex2",
   "1qghns1q7ess1rgic51saibt1snhwq1u5er21uui5i1v3i5p1wgiux1wvgek1ysiid1zuojx1z5el6203ojk1zdfhg20inx8",
   "201kyz20ufh8228feq22mh2k23qjzh240jz6245iep244hpi24biex248hok24vkz0247fh024piev257opa25eop625gkad",
   "25slu625rjzc268luc266h0426phm826uh00275hlb27ehm727jii327ef1527zihm289hm128efcd28thlp28tglq2a9fh3",
   "2adfgw2acevq2bxo5f2byo6s2bxo6e2c3o6h2cuo4g2cuo412cao3r2bqhv12clo422clo3y2blf1c2cjo5g2cso5l2fxfc4",
   "2gsi5c2gtefm2i0f0z2k7ksm2k7eqn2koiu82lkkn22lqklu2m5kix2mrk4o2osu4d2myk3z2n5kko2nbgm22nsg9t2nufcm",
   "2pvk3n2q0k3r2qcm542q8h7w2r8nj12t6udb2s1mdr2rfgam2rlfgp2srgao2vop202vfi5u2wdi992wnir32wpi9l2x7hlg",
   "2xbhzc2z1pc1306plq300mpy301mqc2zwjhd2zmgxi2zvgmr303hoz30dhot31dnan31mnb431pmpk31xmpj329loa32al7a",
   "32ak7v32siit33dkxw33gky433oik235gjux35pjuf34wo8g36jjtm36qju036rjto36phpp36qhkx38kglt38pgm537mja1",
   "383gl638jg2a3a1irq3calbh3colah3cpj183crgmz3echlh3ekfm43ffi983gsgma3haffz3kfnng3kjkbs3jtdum3mafhj",
   "3nui8c3p0nn33p9nmu3o1f3h3ond8j3pxfu03qyi8h3s3i943siik83shhyz3tkm4m3tnhz13u6i873vukkf3wtpsk3z3qcd",
   "3y4igr3ykgm23ypgmb3zhijn3z1f5040fihu405fni41alk840ygm240tfc5414f0b41lf1341wezn41vez846dl9948pre2",
   "48sre748sq7k48qq7l49xre2486f3t4akqkc48phzh47xhz74d9qbw4dlqga4cgkki4dxf6g4dwf6p4e6f5p4eeflj4eif5u",
   "4fhijz4i3qub4ivqva4gteux4hvijy4jdpjw4j3l8p4krqgz4m6qh04nmqdb4lghyj4nkqh24lpflh4mbgpb4mhfl34otqh6",
   "4rau9g4qrq704opfhd4r7q5i4ruq864ryq4h4rxq4f4rzq4i4tzqfg4s7i9g4ryfdm4uuqhd4vbqfz4tkixw4tffnu4vjpkq",
   "4vkpkl4tpfnn4uehy94wnq8h4wiq5s4x2q9j4x4q004ycqcm50vqdm4yyhls4z9it2517qdw4z1fg950of33535qa655eq5o",
   "542f0355fiqh58mqdc55udq859qgl959kf445a2f275a2f2l5aui205axi2j5b3i215bdi9y5cnh2z5mrxbs5dzb3z5g6mo7",
   "5fdgnl5fvimg5g8ebj5hjfdk5iume35o5vma5i4eb75jch2e5j1ec55jlech5kah515m4ofk5npmsd5m5fn15otp0b5ovg94",
   "5tqn635ukmmn5uelzt670vym63dmfj63clz86b8njg685n856gztnd6f1fk56h1ilu6h7imy6hbio36hqigz6imf1k6kgfh6",
   "6l4fn46lng4c6r7hvy6r2gzx6rnh0x6talbr6ryfel6s4fih6s5fib6sbfjf6sogjv6sjfex741x4l6y5g3g6z3jz86zdgfk",
   "6zlgkw6zzg3w71kgkz71pgje71tgjc71vgk47fmxmy75sip8773ew777zgqs78mi1t7g7vnx7j0q317gegfz7jkh547leeu3",
   "7lwfzg7nmg6f7vqpzs7u0jy87wuovc7y1pz67xyew87zsczj7zminw82foo880acxo81rip381sip281qio2818ew383kejq",
   "87aovu86qfgk89so0u8ayh3k8axgez8b3ejz8c1hvk8c9hx08fgohh8evhxu8eogod8ergpj8ghglb8grgl08i8hpg8iuhp5",
   "8ihfo08ixhib8kqhjc8ubpq38shfhj8tpefa8x0oek9hby0h92gfi09wlylc9ezmi89gqmnu9xmvkk9s0k3a9rxjz99thjh7",
   "a54w9naazwvvablww8a7semba8aem9aa0kl1bdhz3uai9bytaqjs13aris0uarls19aros1garos0karus1aarxs0uarzs0z",
   "asfs1sapsh4wb9axz2axlfctbwez14b36r7rbl9rxlblgrx7bk6jumbninatbogo3ibokne1bsxmp2bucnaqbuynegbvvncj",
   "bz5mtybztn2kbzwn6nc01nbzc0bnc8c0bnbmbz7hvec0rn6hc1hn76c30n5uc3jnaxc53n8ec6qn0yc5ri7gc7ijswc8rn6c",
   "c93mzfc8kj20d4rz5bcbeesfcgxmwncjvjr0cjzinjckfiuocl1ivhcl6iuycmjhvqcpjn0wcsvmsvcszhkfd0rwp3dlgz3l",
   "ctsfj1cvuhl9cvzhmbcw9hmicwqhl7cwii4zd0jiisdccwp4d62ii9dd4tfldbvjtvdgee5tdj9hmndkfk62dqqpiqdqgl5q",
   "dypwr2dvrkdkdy2hxzdz6ende0dh79e15imoe22hsie47n0se4ufise6lmlqe88hhne96jkwe9hh5dea0fd3ea1f1neebmz8",
   "eehmzmeddeq1eeifigegijw0einisieifglzeiwjdxej5k4neiogwvejrkgjejrkgjelbk7melnk74eminw1em9jx8enbhy2",
   "eneimnenhh7eenpilxenqim4ep2l64eqyhycerikk1es1l59esck6mesol5fetal5ketbl5yeu9fi4ev0glxev3gmmevmk7h",
   "ewhk3lewnk3hex0f8tey5k34eydl6tez4lkaez6lkbez6k2lezrkliezvgm5f2shipf1xim0f3zgv4f59i4kf6qkgdf77hi0",
   "f7hhhtf7ohv7f8ok77f9hk0af96gmbfbjqmnfbwgvgffhhatfgfjeofgijerfhhgv9fldtelfk6i8mfl7k6wflqlcjflxgsi",
   "fn1hk1fnum1nfnum1nfoek7lfofk79fo6hb1fonk7rftil67ftgfh0fthfgffugkkpfu7kdgfu1iiufv9k8mfvtipmfwngbz",
   "g2dd7ofx9glffxmhbtfxuj4cfxcchjfypgkdfz3gl8fzahx1fzhhx7g0uj75g1ll4mg1oiv6g25l2lg3fl6fg5aldwg66oyb",
   "g71oxng7clmyg8ikfugadt2tg95gshgaft3cg9jffgg9xkggg9si8dg9mfb7g9whkig9vfidgawhvygcgfnkgcyhxdgdmlit",
   "gg4h0ogggjncgg9gqxggmi9yggzibvghfibigikk35giok3zgigf85gj4k3ggnyl0mgo0l0agokj9dgoqjccgosi5mgp9fi4",
   "gqhhzags0qq5grvipvgtejt7gukkgkgupjbcgwyf7egy4hlzgyofklh21m1hh1eijth1eik8h1wljth2sj4nh3vrkhh3bg1h",
   "h3af8fh3xgbxh62ttwh5bjzwh65gzyh7mtprh76fnnh7tjtih7qho9h86jtlh87jsph8cm47h9xm3dh9uh0kh93fovh96fov",
   "hbns1qhbwfbyhcdm9xhclrt8hctrt3hd0n6bhdbrshhdcrtchd9ldahevg13hf8gbohh5hyihgzfvshhwjrwhiajsvhk5jr4",
   "hk8gbyhkgjsmhkogc0hl8jsdhl5hnzhleoofhm1k5nhmdhoghmsoo0hn1in9hmsrwwhnem36hnegdahnggchhpekn3hpikjk",
   "hpmkjmhq1h2ahsdmrthrlt2jhrhh16hrym5rhu1fchhuommzhusi0zhw1n6ehxdgcahxpjhphyqqjohyzqjlhz0qihhzcqih",
   "hzbhw8hzgho3i12ktji2oiywi3msimi3sui1i4nm1vi5bc53i5bfgri7en5gi7fn5ui98c1wi9hl86i9tfgvi9ykf5iamkff",
   "ibakfaibqh37idpkmxidrmshigcj87igzgnaih0kkyih5jrrihgnnticyt79ihpnz5ihzn5jii2kzpijgj5iijhl5dik9h2i",
   "ikqfcsikvfcximwl83inil8iinpjhpinyjt1iobmj0iogl9jipgjvxipckf2ipomnsiqila4isql0witbl2ziuggiwiukl2j",
   "iudsg8iwdwuyizolbfj15gzxj1akquj1xej3j20eipj1qlzij1xkcmj1ykipj4bfykj4dh42j4omluj50gdqj5rkdij63jyx",
   "j69jyyj62ny3j5ko59j5ko57j6pnygj6zo0jj72nfwj8qh30j9agxdja7o7mjaql98jb1gdgjb8ew9ja5sqljbhnakjclnae",
   "jezgnijeon9sjf7napjebupzjfsnavjgfna9jgfnmijguk4fjhtmd1jilnsxjjknt4jkzbw9jmhkeyjmtmmajmzsqijocl78",
   "jowht7jp2htqjpqm7jjovu14jpusjyjqvmwyjrkh3pjrmm3vjugleyjvelg1jvhlg0jvkmx9jvmov5jwnm0cjxhejrjxfm4z",
   "jxugtzjxkm4yjxlm4ljxqm4ejxrm4wjxrm4bjy6ivpjxcj9rjygiw5jz4ch2jxfti9jyqiwajy6j7sjy7j82jzqciijybj80",
   "jzyl64k04l6gk0jotsk1qfgck29m9hk3kh4ck3sfiak4dkqwk5zkdgk7les4k90i27kalhggkamhh7kavleqkjxp4pkcriz1",
   "kcwlkikcrknmkdigdqkd9jv8ke5knzkefrzpkglhyckgpi3wki2mmmki5mo1khgs7kkj7h4qkismw7kj1mnmkjamndkjcmnd",
   "kjcmmskjimmykl4ej7kkdmw5kkat4kkkdt3skkit3qkmvfhgkkut4okknt4ckkxt4ckn2fibkkyt4fklat4jknafi9klft42",
   "klet4jklet4nklgt4hklht4nkmrmn6klht4pklht4pklqt52km1t4jkm2t4ikoyiokkp6ioukpqmswkoxtbnkrhimzksdktg",
   "kofwewksxktmktci5wkt7ktgkt2mi5kt7kwbksms71kuciobkvgbxykqyw8dkw5by4kv8m56kwjbyakw3izwkwgkp8kweli1",
   "kw7n61kxikejkxolhbkxxli2ky0li2kyfj2xkykkw3l0khf2l1lh5wl2bkwrl3ifyzl40ejyl5ugwjl5xgwgl6gl2al7vhrm",
   "l7uhedl83hell8lkysl9cgj4l9fh5yl90ljel92ljol94lo8laehctlabi99laelu1ld3imylddimjle9pyjlg1f84lgfi6e",
   "lghk8rlgjk8llevtk8lfntixli0h3yliah47lhllkplhplkjlilj32linj3hljcj0iliyljflhiwbflkpmrblm5iwtllcno3",
   "lnokgxlomi7dlpai78logo6tlp7n68lphkr7lpil30losiyplpbn69lpen5zlpen6tlpyn7flqdm4plr1ir5lt6au7lsbiln",
   "lscjeulr6o8qlqussjltyqbvlt8rzalteoc0luzrlvlv7rldlv8rl5lxikxllydjv7lyklmelyllmxlzikdvm0giopm0cjw8",
   "m0kiobm0liozm0nioam1cjvwm05qk0ly4vswm24lu6m2oiz7lzlueem3pllom3slsxm3tm4fm55le0m5vi96m6pf98m58s2t",
   "m58s2tm8alejm9nhtomamgjxma4lr1ma6lqjmazixp------m8funjmbrinqmbsinzmc7im5m9psvrmchip3mcsiy7mctiyu",
   "mctiyimars93mdclmcmdillvmfne5nmeujvcmeyjvgmg7gnlmh1e5hmh0jegme0vojmj4gi6mkglg7ml5lf7mo2ir6mo4ira",
   "mopjf8mn5qjbmpefrsmoujvdmoukwqmoykxampqkqfmpjlu6mpolu4mnst4bmo8taumnqulgmruj5dmrziuwmsgluamtkgzl",
   "mtxiuvmukixxmuqixxmx58vbmxdj1umswvh0mqlswfmy0jfymyfkhwmsax32n23h3sn1qjonn3yl3in4ikosn56h9on5klrv",
   "n6zjczn8gjiun80qkvn90mq6nbsho9ndiizxndhmp7nbsho9natvndnfzlg5ngzkezni4m4wnj3l44nmhle4nn1ljfnothov",
   "nppjptnpgn8on8iyilnqhltmnqtkh9nrelmln9uyhons8qolnlqwhhnpjvvknr6vwtnxfmhbnyckewnyhl6anyplhknx2rm9",
   "nxcrmsnt8w2oo0jl4xo0kly0o0ul3so1ficao0xl30o0yl3ko15l4no15lj9o1dl3mnvjw47o1xl4zo1yn9jo3ikzmo3jkza",
   "o3tkqyo43ljlo4ellfo4ilkno4plhfo4wl06o4ulmro4zllco4tlnvo50liqo4uljto4ylmoo50lioo52lk6o53ljxo55lk3",
   "o56ljko56lh0nz9w3zo5jlhpo5mlmwo5aln6o5ulnio5wljzo5wljjo60ljvo60lfso76k5mo7hji9o7rkgso9jk0ao41vxk",
   "o54vx2obojz1odrdixo6jvzhocujwnodpk9cohic2ioe8pazogtl40od2ui9of6slmodzuueojyhp3oelv6yoe1vogoecvo3",
   "oehvxnoeyvn1om0lw9oqojouov8ra0ovnr8qow5rudp2nlumox7vixp10r77p04tq1p1wv47p4hs9ep4js92p6atomp10r77",
   "p7iulfpbktdipavumfpgnm0apent06pigmm5piomlwpiwu7jpjcuqkppuit5prdk5iprip9dptdplqpusm1ppwqffzpsitzy",
   "pvfp3qpv1thepr7whcpw9th1pzxlbypsewhaq2skjeq3fnapq6fgkxq6ktp3q6ptpbq6stp0q32w93qbqqr2qbtqriqbyqq4",
   "qf0qf1qn18s5qgwtvhqrllfwqswmbaqp6ufzr4pd48r4gn0xr4jn0yr8vd9qr94d8xr9ogk3r9fo77r9mo89ra5p79rb3n4r",
   "rahp74rcom7xrfke1prfwe2drekn0premt48rsafu9rqgpxxrr1pzqryqd6iruiruss47cfqs1gt9hs8vq1isd6g8gsbzom2",
   "sxna2ssyqhoit2fm5bt3nsq3t5ws0wt9tp5ntadp6bte1q7zthdm1etjjpjbtkanjttmlf20u2qejxu91ozru9qq8guf6llx",
   "ugvelzug2n0nufno4yuk7jatukyi4suk0q1uunfearunsikyupdecaur5eydurgeyouszg6sutkjzg------uw4hzyv1re2n",
   "v3cl4av5mf71v71g01vaof9avb2eqqvb2eqqvbteqdvdlee4vf7eolvfaep9vg5eetvejo7jvi9f7dvief3mvixex3vj5fbn",
   "vj8fbjvjgf7hvjkfc5vjkfbtvjofchvjpf89vjpfcyvjqfbmvjrfcfvjpf89vjsfd5vkleu5vndfuuvnuerbvpukhvvrrj0i",
   "vscj0evspigrvrmrdgvu3ijxvujiigvuqicsvuriljvusifovsyrjxvvqifsw08h0ww09gvnw0ki7vw0yicbw0wisow48gun",
   "w4wiv2w2lt3cw5fimaw6hijkw6thrfw1xlqew6whs2w73hq5w7zhsaw8odrew8mhq9w8whvgwaxee9wb6hmlwdihwbwe0p2v",
   "wi8dinwi7kxcwjjitjwh2thwwlnh0twnajw7wnjivpwluslcwobicbwmhsnhwrghgfwrug5awrriejwrziebwt5ioowtufbw",
   "wu0gi0wwghf4wwfhp2wyhekcwymhdnwyhjonwyui9qwyyiagx0cfdcx1tivkx2pg0kx2aly7x2rg05x2piipx2wiuxx2uk8m",
   "x32iiox3hg0kx38l0rx41iixx6ck0sx6rfa7x6wfapx92iqkxayfg3x9nskixc3dkwxchfymxe6ievxeudppxf0dpaxeweso",
   "xdspgkxefssqxh6dt8xk6j10xmyejuxq6hrgxr0gz4xv3fevxvmg8wxy6owny5ifxcy5ek68y68fb5y26y36ycei9vydsfgb",
   "ydvgvyyf1givyfhaphyfdixoygql18ygrjoryhffw6ykvg79ykmlbeylahg0ymchcqymmhcxynufajymou1qypvfgzyq7lg9",
   "yrznxfytkj5syuncbdyuuo3yyxhgm8yyfk25yywfx4yz3k9nyzhj6iz0riciz2bk9kz2ek9yz2jk9vz3ijxlz3wkxgz53l2j",
   "z5wfhvzz9h6az8heqiz9jhe4z9fkw3z9pfgdz9qfawz9thevz7ykeazapgzyzarfb8zbuiwrzd7hdazepx4nzgmiykzj7isx",
   "zjghabzmciy3zn0ic5znckeuzokexszriiexzrxneuzrxnelzu5k9hzuvfa6zwhhsvzwihtezwphxszxekhqzxfkhozy4f6x",
   "zz3gkjzz5icdzz7jdhzz9h6azzcrdl01dk9o024itg04lgkx04pfp606lois08nbjl08w54j09kgim0cermo0ckrmq0cwrmm",
   "0eaa5b0g8o070gjo0k0humr50i1mee0immin0iumdf0j6mm90j8me90jcmi10jgmi10jqmef0kkje50m1pmx0oujrw0qrmam",
   "0tecvm0ttbjq0v3bzv0vkg4j0w1hfa0w7cxb0x7mso0xwij80ypd4r0yqd580z4g730z6j7c0zijch0zmjd20zijch0zyjdb",
   "10fjcd10ijcm10khxm113l8w11yda512rdjt137h6c13tcz7138gd2140czg150coq15qnzj157ctd15nd5616gmm416lnkc",
   "16jmlz175mh217vdac19vdad1asb451bktbt1awdgp1c4j5j1d7oi41ce8gy1cf8yn1d9may1c76dm1d8j5k1d3dau1dkdam",
   "1e1d631eag031fb8x11g7er51fv87w1gjfkb1gyi481hhb4u1ht9xl1jjevw1ht3j71hz3ix1mbif81mmomy1lp7ru1mgcii",
   "1lv7sk1ncohd1onom21oiksh1nr8nl1ovehq1p0ehy1mu3la1oy8m91nm3ca1pd8s41pxca71qdiih1pg8nd1pv8pd1rnljb",
   "1qy8ta1rylj61rylj31sfoo81rxbwu1t5oo71smhv71sohvg1qp3n9------1sxhx11qb3d01t8l5e1tgl531txpry1ucon5",
   "1so6tu1t37x41u4iew1vgoe01vmoob1voo1e1sq3qf1w2om21upbgx1w9o7r1wio2i1td3nb1wlom21ta3b41upbgx1uw41d",
   "1xzoxu1zwohr1yuel81z0omu204omx1yzen01z5el620lnxt20polx1ze7t220woul20wo1v210on520yj4121kop521oonm",
   "218i0n220ong22eovx22mook22tomy22voow230onk234om623folz23gomp240ooi247ona23nho224bibk24mjqm24ehoc",
   "24ki3724ukyu24ukyu24vkz0259lmx25clbj25sho726gkyd263has26skyp277pf824g3rh276auu29pmad29ulfr2a8gmj",
   "2bgp2b2bmfe72c8kim2c4fjd2b94hq2gmoo82fub7r2icc7t2jajpd2krb5u2kxjs02kub5g2momcs2mtix92orngs2ozba2",
   "2p5cmd2qzmeh2r7nft2rqp6p2rnom62qdbg92rsom92rtlnr2sjp902s1g1h2rgb6s2pzbzd2sren42txmjl2tpkjh2ualyu",
   "2tpenz2uziyl2xuunw2wjlj02wkjck2woitc2wqj4i2xjnq02xlnpu2x5isz2xgkwr2xehwm2xhhwl2x7eow2y5beh2xoblo",
   "2yzi432y1bco2zacfr30dmwz310odj31iod5300fs830rczt30ubm6321jzv321jzr32gjjr33no5z33ll2a34rkp834qj7y",
   "35jl1i35pjuf35siqo366kxz367hw936mcwt393beu3eloj23eqoj63ehj113ekfm43e9brc3g2oh83fvki23fxkhs3h4ow4",
   "3jeoib3jdl5h3nwueo3ki9q43mxm2u3nnkop3pwr6z3pooa53pelwz3qbmm63qvmmd3qxmma3tfuah3qmml63rhml83rhh5n",
   "3siml03qi9du3rlb5a3ql9fr3rrb5m3s0ask3uwohh3soany3ugk8n3upfsi3w5it63waj7h3wtkr73w5gac3yroew42cubg",
   "3z1jth3z6cie3ztib740glux40ikux3z6cie43kuhc41slt041hcd642jim743gkz7432imc436i27449lw2449l1q43ceux",
   "452lsa44vkah44vikq459in943kcem46yknf474kwf4a2u2v46zjvd47skng4altnu484kn747af7948fluz486kos47zhuh",
   "48pkx9488bqp486brk48mbrf4btn3i4asbby4ddjr84cab5s4dtjrk4deeva4eajv14eijvi4gej604g4hj34fnu4t4m4qk8",
   "4lijx74nqp7a4lka414m3cia4ku7wb4lb7kt4li7kr4nug1x4qdpq94p1imn4qqq6f4qrq704o0bfd4p9h4b4r7q5i4ruq86",
   "4ryq4h4qzlua4r6lx54pmde04r9lx84relx54qncy64p375n4rpfu94rbdio4t0cxt4wcpfi4wgpf74wlpfo4tv7vw4vibuw",
   "4yxq9t4whb4l4zxqb84vl71a4xmb9f4y6dpo50rp2b4x27va4zmbi94zh82w4zw7v150986w51z7d255oiwp55gbf553z7gg",
   "5487uz5497uo54e7w054m7nq54q7qy54s7nr54t7nm56rdor54w7qv57wivk582icl55b7qc5547fy5a4qk355m7zx55u7qh",
   "56489c56g7ec56z7sa56y7kl5b1mvk5747gq5gv96h58p8ef58d7h358g7h559i7xk59r8en59t8ek59z7wv59u7dh5c4d99",
   "5ccdpc5ad7ma5aa6jv5e0j0h5b07ib5bi7pm5bw7x05bb6k45c787k5e2dqo5dzb3z5c57d55bv6ot5cn7qh5g1inj5d67vb",
   "5em8yp5ev97i5ed7gx5eq7lu5eq7ln5f18385h6ewe5fg8ig5ioljq5fe7yx5f36et5fa6el5igcml5fy6g05ivdhj5hv8l2",
   "5m4ofk5ij8xg5i66zm5kha0t5jq7t45oimv75mb7p15mm7sr5odb9a5nc7o65ran465mm6j95me6675sdi8k5oy6ly5q8888",
   "5rs8a35v2k535wqorw5sl8465xwpcv5v1at15vucd95vucd95u887a5ss60i5t76i85tn69p5x2ekt5vu6nf5yd9x761tm1q",
   "5x064d5y47fz61pj4l5z076s5zh7gv5yt66w5zq7gp6027bq60d7dx63jfri660pf86167gi6167fu64ge5j65mgvb66c6xo",
   "66j79i65y6eo6858wa68xa2867h6906806sv6856sq6bpbhm6bcbfp6ak8jn6a279g6a473d6d5fd56aa72d6dgfd06bcbfp",
   "6av6ae6ck7az5st18f6dh74s6ec84m66p2cl6g187r6es5yi6jrit56g46ta6iebnl6g46od6lmm7s6suwdt6kfev86l4ev2",
   "6jc6ta6l771x6rsp376ny9kx6nc8cw6m56ej6nm7db6o88bo6nx7d26s9jjg6rsgu96pb8cr6swi436sph266po7936spguj",
   "6q479z6q878g6ro77c6sw8cb6s97476se79q700n5c6rznbk6tk2w4749b78760h2d764h0e76shgh77lgxg77wgz378qh05",
   "79dgze79ogwz79sh0r7a4h177ajgr47aqh0c6zu2ms7epeu978i45r7excar7gijnb7fkexx7h3hxs7h5hxt7ap44d7igivk",
   "7hleu27d045v7fg4q07fk4q07fj4b87mggjo7o6dxi7z9pmx7zsczj7z4aky81rip381sip2841clh81s4ep8204ek82h4dy",
   "8aoddc8aoddc8b3ejz8b8f7q8jvvvi82s2ws8bwapx8bwapx8cxdak8cxdak8dreev8c12xb8k57sk8bu2e98o7e968r8mrv",
   "8id42d8g031k8l4bwf8ha2vy8wrr7y8s6ac38tcefx8y4dd3903b7s911d9k90lb7894emtx94bmtb94scff98zm338vx2m6",
   "8xo2z09bsllg9eudq39672xd9jjfeh9o8ttd9s0k3a9ufqxq9rxjz99uoqxqa41eewa66i9ha9poowaq7x2japtp22aosohr",
   "am6fwlaovoi3avzuzgas7n9vatvlsrauslseax9dx1b8hwfbb2yohyb2jmb0b2gmaob2gmawb4hjs8b8xphnb99mv5bc0o9s",
   "bc2oaobcbo9lb7m7qybcroa4bczoa8bcsmsjbdgo96b7h5j2benomhb744hhbiiougbj6ougbo8ndhbn9b4tbqvosibsxnhv",
   "bwmu26bx9tc3bxzoiebz2oisbz7nhqbzxonobzmmzhbzij4fc0rnhzc1hmvwc2dnhjbx666ac4mphmc4qphsc59phpc59php",
   "c4xp6tc5kkibc6fp8vc6ejlsc8rn6cc9vn4xc9xj0mcbop91cclr5ccchp3jcc7mtccc9mt5ccqmxoccqmxkccpmrucdbmw5",
   "cdnmtqcdomtrcdsmsicdumwqcdxmwncefmrpceemn1cehmmkcexmwccewmq5cezmsfcf1mxscexma5cf3myecf2movcf8mu2",
   "cfhmq9cfkmprcflmpocfqmxncftmpacfnlovcfxmprcfzmqqcg2mu6cfwlojcg8my3cgbmyjcgcmlxcg7lticgimwlcgblqw",
   "cgelohcgflqecgflokcgnlp1cgplq9cgqloxcgqlpocgslouch0ls5chcmyichdmygch3lpych5ls6ch6lshch8lvochgmqz",
   "ch8lp6chclv1chdlp9chflwuchlma1chilsochilokchjls2ci2locci4lohci5lv8ci7lomci8lopci9lvdcialvtcijlvy",
   "cimlw2cilltlcinlvyciolveciologciploxcgwcxccitlp9citlpaciylr3cj2ls6cj5ly9cj8lrocjelq2cjelp1cjglqf",
   "cjilozcjhlp2cjjlq0cjslu6cjyls5cjzlsvcjcimtck2lx8ck3lvsck5lrqckclxockelzfckqltdckplq0cktlvqckzlpg",
   "cl0lpgcl7m9mcl8m9pcl5lqzclcmabcl7lprclilszcljlqcclqlznclrlxvcltlr6clxm3uclvlsucm1lwrcm2lpucm7lx4",
   "cm6lqbcm8lqecmem3ccmilwdcmklwgcmllwdcmpm2ecmqlwicn6nkocn4lzkcn7lw1cnaly9cnonkgcnonkgclre8tcnflz5",
   "cnnm1ocnrlxecnylyjco0lz5co5m2mcpjo36cnpfc7cplo2xcnsfc7cpoo33cntfcacpvo2wcpjlyhcpwmescqqo4ycuyohi",
   "cvopgbcv9n5scyqo5qczylxfd76wpgd1olxud0h7e5d42lnnd65nmtd6fnnad298dbd60lj2d61lj5d62ljtd72ls5d77pm3",
   "d7dpjtd77ocud5jexfd7dnwbd7upfyd7aljgd7clisd7ilt2d7llnzd7mlsxd7nlt4d8glpid8llqyd8vlrad91lqad9hlpm",
   "da1lq3daall7daylmbdafimbdcxojadczm1mddbm1kdf4pvjde9hbcdgoil2dixpkpdkxo49dlcnuxdlynl9dm5kx2dm7j3o",
   "dmymiqdojpfxdo5n96dmve60dn0e5pduqwoldpsoindw9wowdr1mkjdr3mkfdsdnrjdtko1idtwod0du6nsgdu6nsgdoe40f",
   "du7nzzdxen33dw8mp6dwdmozdwbm6odwflkbdx5m1fdxooxndxdm0oe1duuidz3oz0dzeorxdzzpfre2nmjce2pmiue31mix",
   "e36mw0e3emwje4epo4e4jpo2e2qbide54mo7e4pgmte5xm9ye6no36e6hmlue74nyhe73nzwe7hnxve78o09e79nzxe7hnxv",
   "e6qisae6afkte8io75e669fje6ha55e99nbte95m0ne6v6lkea3gtmebrnzhedqoy2ebxafdeeoph0eeifigegbnm0egvoy0",
   "eizoy2ej8nmfejankuek5p9pegx5zcekyp15ekyp1hegp46lemmngbempng7em4bn4eofop9eo9j51eoybfkeqhbfkeqhbfk",
   "er0bf8er0bf8ev7phcevcpjcetkb92ewepfieweot2ewpng1exjosmevnbdfevnbcwextoq2eylpf4excbjrf04pmuez7cko",
   "ezkdfnf1dpfvezyc2rf03b5kf0hbr1f1db6ef43plmf36b7kf3hchhf3kb1ef3ubq6f64oamf58eihf72ov2f7kpkgf7noo3",
   "f5xb88f6ebcif92patf74aycf95pajf9fnlaf9mmvsf9pb14f8f5h6f7z4ldfajbo6fbdb1yfeipmdfd9b4rfdab6sfepbac",
   "fh8oxnfh1l8bfgzbhbfjbpagfj6nl3fk3pbefjsmxifk9pbifkmmx5fjfb9xfjfb5afmmnmafl5awqfpkvokfmvbh0fnebf3",
   "fp8ojwfonb83fqdn7wfphbp2for6h5fqabxjfs2n7lfqvb0nfreaxffryc98frwb35fsnbx8ft4d6xfwnne4fwzp0dfvm99f",
   "fwnfgdfwhd4vfxtfryfus3cofy0cl0fzqncffxp694g5zwgpg6iwgpg2o54dg7lol2g8hojyg8toleg9aplag9apljg98ojx",
   "g9afktgaxom6gbek0zgc9ojxg8volggjfprdgjupl7gjwpr9gjxpqdgjsnk2gk1plcgk6pp8gib4y7gkpeqpglhdzbgole3t",
   "gole37gq6ndpgqwd96gshkf9gtdkf5gtgkgpgqw2odgtskc1gtvkbigu4k3hgu5kajgu8kahgugjx0guhk41gujjxfgupk76",
   "gurjvoguukgbgv0k0wgv2k5jgv2kdkgv6ki7gv6kffgvak1mgvbk84gvekrqgvekg4gvekhmgvfk3ygvkkhzgvlkfkgvlkh4",
   "gvnkqlgvnklkgvxkksgvxkhjgvykpzgvzkjygvzkiqgw3kiggw4kcegw6kr8gw6kf8gvzf5ygwbkoogwekcugwgkmhgwgk14",
   "gwhk16gwjk7jgwkkg6gwojypgwpkfygwqke1gwrkeigwsjylgwwk8ogwyjvrgx8kf4gxbkmbgxbk0ogxckl9gxhk14------",
   "gxlklbgxmklfgxokemgxtk5jgxukpjgxwkobgy1kqugy1kjugy2kohgy2kdkgy3kdqgy4kesgy6k81gy6jvrgyalj2gy9kho",
   "gy9kdpgynkicgyojw7gyqkjigyukifgyvkpogywkqwgz0jxbgz9kflgxq5gdgzbke1gzckc8gzekeqgzfkekgzlketgznkey",
   "gzrkgmgzsksjgztkengzuk55gzzkoogzzkolh00kemh03kooh04kojh04kh1h06kpmh07khbh09krmh0dkhlh0zov9h0tkhc",
   "h11kuwh19ovdh13kdsh16jr0h16jtwh17k37h1ajqlh1joveh1ekooh1gkcih1ijrdh1kjreh1ljpqh1ojxjh1xovfh1ukto",
   "h1tjz4h1uktuh1ukrbh1tjzph1ujofh1vjk9h20mv2h20kj6h22ku2h22kjlh23km2h6ec7ch25ku8h25kkwh25km5h26ki7",
   "h27ku7h26judh28ki4h29kpwh2ckpqh2dki3h2eki3h2eknzh2fkekh2fki6h2hko3h2jk12h2kkgvh2nkorh2mjryh2vkmg",
   "h2xkoeh2zkofh30kq4h34kjfh37ku5h38jwsh3akkuh3cka4h3fjw1h3okk3h3okfdh3qjv9h3xkcah3zkheh40krph40kfw",
   "h41k1bh42kfwh45jyxh4gkn7h4ikswh4qjxhh4rkb0h4xjtqh52jpdh56kxoh56ju0h5ckb0h5ik91h5jjxkh5nkk6h5ok4k",
   "h5pjtvh5tkl1h5tkroh5tk1ph5xksjh5xkadh63kkih6dkteh6djosh6eknbh6gkawh6hjqvh6jk2bh6mjk9h6njsnh6oksp",
   "h6pkpxh6skpph6skffh6vjteh6xk29h6zksvh6zk5wh71konh71kiqh71jxhh76kmxh76kagh77ki7h77k8ch79ksah7fklt",
   "h7djthh7ejt8h7fka1h7fjykh7fjtuh7ijskh7ljxrh7gff6h7ojtjh7rkqch7ujtkh7vkt3h83prqh7vk0wh80jthh83kh1",
   "h83jtmh84jt3h84jtfh87jthh88jsxh8akdfh8fjpxh7c5ehh8ikn6h8ik4jh8mklih8mjswh8okkjh8ojzrh8sjswh8wkn1",
   "h8xki2h95kebh99k6kh6x21xh9cjych9dkb8h9gjvlh9jjzch9gfdqh9pkmwh9qkj9h9qk48h9tkoeh9vknah9vjztha4kgx",
   "ha7kb5ha7ko0ha7k4khackmshaekjfhaekuehaikj0hajkmxhamjtkhankmjhanjz9haokl5haokalhaqg1zhavklfhaxkcb",
   "haobx1hb0kp5------hb2kc4hb3k6shb7kndhbcku5hbjkiehbjk24hbkkl1hbmkmshbljsyhbwouphbrkhjhbskm7hc5ov2",
   "hc6kfdhcdk0mhcgkhrhcik3whcsov1hcwknwhdck1shdgklnhdkk0qhe2kqhhe3k50hegme4hekk0ehelkd2hf1syvhe75e9",
   "hfdkl2hfrog7hfso9shh75b7hit8pjhjhpljhl2ly7hlvoo4hm0oo5hmkncuhmklx9hmrncphn2o9chn5omphnkomdhnpp00",
   "hp2o9ohq7fjchqhgz5hqwkerhume33hr750xhruo64ht9m4ihtah84htuddihu4o50hubh78huhoo8huggyshuggyshwfhge",
   "hvqaglhwroeohx8ofjhxr39hhw5ofrhy3nknhyghkthz8o50hzao59hzuo62i32prgi3ciooi44icyi46k7ki4pk4li4ro65",
   "i53okbi4xkjgi57ceui58c07i56m20i5cm5fi5do9pi5jc2ci5nopdi6dooci6sok8i6gkndi6ibzti6oklji6ro9pi73kpr",
   "i77kj1i76bxki7ck2qi7kk8gi7lk04i7rprki84bp2i8ekaai8gkq1i8hkpqi8gksqi8ikuei8xklyi91pqxi91kvfi96kgq",
   "i9ck1ci9jc0ki9gku6i9jkcoi9nknzia0ktti9zkntia1kuria2kptiamku8iazkndib1khwib4jzwibak9qibakgmibbk7q",
   "ibgkjwibik68ibik02ibjksmibpkk0ibtkl0ibxklkic1km3ic7kw9icfkonicikmuicfkjdichkueictkpiicykf2id6kk8",
   "idj93sidbkthidfkowidjkicidkkt0idlkpvidmkeiidrklridpkvwidrkp0idrmshidvkavidtk15idvklvidzjwqie3jws",
   "ie1kq2ie7k51iecmpviehjtdieckvwieekjciehkb1iegku5iejkjdielmrnieqki7ierms7iesjw6ietjsvietknoieujw3",
   "ieumrkievjvyieuksviewk0bif1kusif9kq3if8mshif7kwiifbjvqifgjfsifgkhoifekghiflkdzifpjc6ifqjveigw21z",
   "iftkh6ig0jx7ig0k62ifykocifzkmtifzph9ig2jopig1n7fig6jfqig5jtrig7jbwig6n0jigajtcigdjweigcmxrigfkqz",
   "ighkngigjn1kigmjm2igmjx1iglmvfigrkrgigqkdgigtkchigvjx1igyjn9igzjkligzjklih1jj0ih2jsiih0nhxih2j8i",
   "ih1khsih2khlih4jtpih2nfbih3mu4ih5ksnih7ngjih9n24ih9muwihan55ihdkeiihfjknihhkgkihjjk5ihljvsihncrr",
   "ihnj2vihmn47ihsj78ihrjtvihtkhfihvjuvihwkc1ii0jtjii1jssii2jsrii3junii3mzoii3nlfihxu4ziiajwqiianl0",
   "iicn4biiejvuiidn41iidnkaiigk9niigk1riiijyxiign3piijktpiijn8eiikn8diidu4ziinnvaiiqkjniiqjc5iipmzd",
   "iisn33iiumxliiuk8diiuk79iiun32iiyjwwiizjjgiizkcmiixnkvij1n0yij6n5tijbkcnijan36ijdn9tijlk4aijgnco",
   "ijin58ijknetijln6dijomulijon9nijon9tijpmvcijqke5ijwkcmijtnopijxjsqijvnmxijxmruijyng3ijyn7kijzn22",
   "ik0n9zik3jdvik1n6uik4k4bik4n21ik3nrkik9jwbikckfjikejc2ikcn7oikcmteikemv6ikljc3ikenjrikgmypikjmvu",
   "ikmkihiklnmeikokpiikpk0qikonp5iktkw3ikukcfiktk2likundpikvn8zikvnjwikwkvlikzjtqikyklyikxns1ikyn3y",
   "ikzn37ikzn4iikzn4pil3nq1ileb2qil5lvvil8jxgilajesildjg8ildkhuilfjfqilijf6ilikanilfnh8ilhnn1ilhn40",
   "illjk6ilmjk1ilpjepilqjbkilonhiilpnikiltjl9ilrmnniltjpgilujupilwk37iltn5wilun42ilunhfilzkkjim0kna",
   "im1jkaim1n4tim1nfxim6k61im4myzim4mqzim6mx2im7mzmimhcskimna1mimckejimcln0imelhiimcn4aimcnqoimhmvj",
   "imhncqimkleiimknh3imln6wimrku1imon6bimqkjjimon31imqkdbimpnhaimrku1imsnccimtnocincl4win0kg9imymps",
   "in2l5zimzmpuin3kgnin2n8din3n2hin9jyainak2tin9k3ain7n7sinbjiein8niain9nciinams1inamr4ingkz4indk0d",
   "incniginco62inhkd1inhn20injkmjinknoyinpn84inpnd8inqn28inqn6dinvjrvinwldainrnjrintnfeinxjrwinwkpr",
   "inwmvgio2k9xio2k6minzn4hio4khoio3jvzio1nirio4jr1io3nkyio6kf3io6kmvio6kb8io6jyeio8kbzio6mp6io6n7j",
   "io8k4sio8nc5iockifiodn41iohl6giohjvriohne3iomlaaiokl7diova4rionk68ioon22ioqn39iotk00ioxnh0ip2nec",
   "ip3mzkip8lgjipalglipanc1ipfkcvipfkppipek25ipen0nipfn33ipkkn0iphnlkipmkkbipknkhipnmymipmlolipvkzz",
   "ipukkziptncyipvn08ipvn0cipwn59------iq1n50iq5jvqiq3naiiq3nrsiq4mxciq9jfiiq3pjniq5nj0iq6nk0iqckdi",
   "iqfkyhiq7lstiqamx0iqgjzxiqgkabiqjjcriqfncpiqmk5piqpjkliqrka4iqsl06iqrkotiqon8uiqxkxriqtkqciqsmvq",
   "iqyk4fir1kpwir6k5lir4mqgir4mpiir9jteirdkbmirfktyirflgmirflrfirml0xirglxnirpk9oirwjm5irwn41irzkem",
   "irznrqis7ktmis5kgsis4nicis7kjpis9kaqis6k4wis9lfvis9n6kisancxis9nrrisekbpishkyzishnhyiskn5niskno6",
   "isokj4isknmnisrkfnisonh6isukdlisyl25isvkgpistn78iszkeuiswkd3it6kcvit0k1tiszn5rit5k93it5l7bit3my1",
   "it3lncitdij5itfkjyitfkt5itdn7hithku7itfn2xitfnd5itlka3itqnkditvk9pitslhaitvjuditxkkkitwjvnitun9p",
   "itxkg6itxk6oitunf2iu0kkjitzjvmitxnilitynd0iu0ncmiu5n3iiu5nciiuek76iugksjiuhknxiucnbniufpk2iuqjdk",
   "iurl6yiupkjqiuon2liupnc0iuskeriuuk7piurngwiurngziusngriuunc8iuunkliuvnhniv2jtwiv2jxaiv6l4civ3kp8",
   "iv7jfjival1liv7ksxiv9kukivbk19iv8n4xiv8n8bivgl42ivcn50ivclk9ivgnbpivhn6civjn5livekzuivon59ivpnb1",
   "ivujj3ivqn8wivtmsoivxkjsivumsmiw4kc0iw4n99iw8kuyiw4nayiw5n8siw8n9kiwdk6qiw9na1iwanl3iwbnlciwbnlj",
   "iwcn8liwcnl2iwcnliiwene5iwjlbtiwgkdbiwgneaiwhneyiwhndoiwkjzfiwinl2iwjnl2iwlncniwqk8diwrkpxittyig",
   "iwjlv4iwomtdiwpn7siwtkbniwtkcniwtkhbiwwkqziwzjboiwykdnix0k7xiwwn7yiwulnriwzmvviwyn8vix2kngix3kg2",
   "ix0nd6ix8ki5ix4nicix9kudixbjdyix6ngeixcjdvix7nklix8njsix9n80ixemr9ixlnayixomrtixmnn3ixxncaixxnfb",
   "iy4l1miyhk0iiygl43iyikcgiyjlwpiylkisiypk2piyrk3fiyqkvciyxndhiz6ko7iz6ky2iz6kr2iz4n9diz4ln1iz6ky2",
   "izhjlcizdnc2izemttizdnkxizml3mizll33izjnf4izmke9izmk6yizln4vizlnhzizpn8wiztkpfiztn33izuklej00nc3",
   "j06jz9j06jywj07kkpj08mexj0bkxyj09k3qj0tandj0enayj0fnayj0encgj0mkhbj0knatj0knb3j0lnazj0tk3fj0sklh",
   "j0rm7yj0qnalj0tncfj0wk8ij15k9zj13minj14m4sj14mioj17mc1j18kxuj1bml3j1gm7vj1gmhyj1gmonj1ikg6j1jlzl",
   "j1mkapj1pjkhj1eq8aj1eq83j1gq86j1qkcrj1omp9j1xkcmj1vm86j1wmi2j1pq95j1zkpmj1zm6dj20m6cj1zmkaj1tptj",
   "j1uptej23m67j24m69j27kcjj2ajdgj2ck42j21pp7j2dkvdj2dm64j2jk2kj2kmjyj2mm74j2ok4wj2tk8qj2tmjqj2ulzh",
   "j2ppyvj2zk8pj2ylssj30lupj36k7jj35k6aj31plej3ek5jj3clv5j3fjugj35plgj3ikmlj3ojt9j3rkf8j3rk8gj3vk2p",
   "j3nq8ej3yk1cj3xm06j4ajmcj3ypwjj4akgxj4bjmdj4bkevj4elr1j4dkcsj42q5aj4fk21j4elr1j49q4vj4lk6hj4km70",
   "j4epvbj4mm8fj4lkhmj4ok2cj4rje3j4nmlvj4tkqlj4smb1j4tme3j4wlugj4zklkj4zm5vj50lu9j4zknzj54k7xj54lwe",
   "j56lu2j4zpkbj51pldj59lvwj5alwnj5dltjj56pkbj5hlsvj5hltoj5njo3j5jltxj5kkdsj5eppaj5eq5kj5om5mj5okdh",
   "j5tm22j5zmg6j63meaj69jyyj5xppqj67ltlj68k1bj60q4aj64q3dj6jju8j67pu1j69pb0j6jk1gj6bp99j6jkcoj6hmhv",
   "j6ojttj6cq4aj6mkflj6fq1oj6omihj6jq2nj6qq42j72lvkj73lusj6vpt4j6xq4hj7blruj7bm1ej7fk7zj6ssvhj7fk7t",
   "j7eltwj7jlu0j7aq56j7mm09j7qkbij7ujujj83f4bj7lpbcj84k6vj7upndj86k4jj7wp2ej7upnej81kzcj8kh4aj83q4a",
   "j86papj85q4nj8hmaij8xgnmj91ctdj8lm0cj8olurj8jpg1j8rmkdj8tmcmj99f4gj8ppf8j8zm6zj9cf4vj8rq6cj9gf44",
   "j9kf3qj9mg6zj9sf3nj9bpl8jb0c15j9slytja6f32j9rpymjaefc0jaef5lj9uq1cj9yq1bjaely0j9sf3njalm31jalmch",
   "jaomgvjagq2ojaipssjawpyojaxpq1jbekq9jbbmevjbfma6jbdq5jjbeq0qjbsmdqjbrp5kjbvprkjbxq63jc1pcujcem0n",
   "jcjlx6jcjm5ojcwg6cjcpluyjchpnmjcip7tjcipp1jcslsgjctlrujcumh0jcwlsdjcxlsqjcxlsljcxmh5jczlsajd2lsj",
   "jd3lryjd4lshjd6menjdclswjdclu2jd2q0hjd3pq4jdcmi0jdfltnjdfmijjdpgdjjdhlxpjd9pfijdilsvjd9q26jdbpww",
   "jddp7bjddpfqjdhp7kjdlpuejdmpq3jdxltajdnpu9jf27xijdspxmjdvpilje4m4kje4ng7je9mdyje3p75je3q2vje7p9b",
   "jejlyxjeaq3cjeolr8jf0ghjjegq2rjehpxzjejp4ljeipzcjeunghjerp9sjezm23jevpq0jf6mefjf7mh3jf5pptjf5pzp",
   "jf9pq7jf9pp1jfbpl9jfolr8jfjpa8jfrmk8jgddfajflq36jfxm2ujfnpr3jg6lx8jgalwzjg6pbujghlrjjgena1jgilt7",
   "jgllrhjgllr0jgmlr0jggp61jgfpycjgip7zjgrnmejgvmr7jgnpzjjgynk8jgznk1jh3mt8jh1nkejh7lqwjh9lr3jgzpru",
   "jh9mm7jhalurjh7nlkjh2ph9jh8njxjhamsyjh8nk1jh8nkjjh5oyzjhcmqejhbnjzjhbnkijhglrnjhbp65jhbp84jhhnle",
   "jhllxhjhaq2vjhlmkhjhdpgejhknkrjmtaxkjhcpryjhjnkijhepcxjholx9jhfp9jjheptvjhfpg1jheq0kjhfpukjhplxa",
   "jhrlx1jjebjijhhpqvjhipg5jhjpcnjhpns1jhpns9jhmpcrjhkq4bjhvmjkjhmpt2jhlq3cjhopc7jhtnlejhkf68jhnpx0",
   "jhoprujhqpcojhpprgjhrprfji1mj0jhupehji4lzqji3mgxjhwpbyjhxpkkji3nlmji4nm5jhzpftji8mhzji0pfsji0pfq",
   "ji9miejhzq3iji9mqsji2ppzji8nlwji3pp1jielthji2q3njifltjjicnlxji7pfeji9p90ji8pr2jifnlaji8ptujienru",
   "jifnlejibpeqji9q25jibpdqjiapstjicpeojilmc6jiknm0jimnlkjinnlejijpewjiqnl1jiqnm8jilpc4jivlxqjilpyr",
   "jinp9ojiopcijisnlwjinpxljixml1jixmkwjiymkxjiopy8jizmmqjj1lwcjj5lurjisq47jivpwzjiwpyzjj0pukjj0pyu",
   "jj2py5jjilurjj7pzkjj7pz9jjap80jjkluyjjvgh9jjapgxjjapzdjjnlsujjnlzqjjnmoejjfph6jjgpbgjjrluljjslum",
   "jjqmjyjjipgujjhpmmjjjpe5jjhpxujjkpbvjjtlzyjjknt4jjulwfjjlpd8jk0lz8jk0lu4jjvnsrjjspk4jk4ltijk2msv",
   "jjvpbjjjvplgjk5mt0jjvq2xjk0pzkjk3p8ajk3plpjk3ppujk3pnjjkenmfjkfmedjkapp1jkolstjkolufjknnm3jkhpfx",
   "jkrm3ejkfq0qjkjpg0jkvltejkjq3rjklpnpjkxluhjkqpezjl1lutjl2m1ejkspnujl6mkhjl8lrdjl9lv4jkzplxjlbm1k",
   "jldlrwjlelurjl3psfjl7pobjlhnlijjvfq2jl9q1sjlwggxjllmjqjlnm4sjloluxjlpm0ojlqlubjlfpmzjleq1hjlgpdz",
   "jlgpnnjlrlusjlrm1sjlrlunjlrmghjltmeajllpddjllpn0jm0lt4jm1mpqjlqq03jmggesjlwpqdjlzpanjmamg5jmcmkt",
   "jm5pztjmkm3zjmmm5jjmqm3xjmgpzgjmsoadjmzmdqjmoq0cjmppr5jn1m86jmsp7xjnwmkijljfp5jmxpa1jn8m2pjlkfp7",
   "jnufaajn4p7bjn7pftjo9d7sjnimarjn9piqjnlmatjnaprmjnlmcrjndpeajnep9cjngp9kjngp71jnipisjpx4gzjnjpir",
   "jnipvujnjprvjnnpeojotd75jpad8njoymymjosp66jqm7lujp2p60jpomxujphq32jpjpw4jpusjyjqfpsyjqipkbjqopg8",
   "jrcgkdjrqnxwjrupfnjsuglnjszp4tjxybkvjwnn2wjxcfugjxifdajxdhjpjynbo9jy4fa1jyof2tjzqciijz1jk4jz6hhw",
   "k01oe9k0goefk0tofrk1fn3pk27hilk1snchk2wcqnk31cs0k4dbxsk2pnf8k3ifg8k34ja0k43drtk3mo6pk3zo6wk40o71",
   "k4bncik48o7dk5ach3k4gnajk5ecnxk5fcnxk62bxek64c0uk6ecepk5jnamk6oc40k6qcj9k6scfbk6zck0k77cj1k6do71",
   "k6mrdfk74np9k8jbz1k8pcchk8tceck9cccgk7prdvk9acexk9ccuhk87pisk9jcqyk8apj5k8fpivk9rcxlk8fphcka5c0b",
   "kadc7ykc74szkaoc1xkawcd9k99rgnk9frg6kbackokbmd5pkbdckdka7rfpkaznoekaercxkalrd3kc8ch2kben36kd2cje",
   "kdbckokdtce8kf95kxke7cgrkegctnkevc8skexc6kkezb7gkdsna9kexcotkf4b6qkdwoomke1ooake1op1kflc9okedooo",
   "keeop0kepoonkeyng5kf7ojokgyc2fkh2ctwki47sjkih7sakgincnkglncjki2cwlkiac7zkjlnf5kl1c7fkl4c1fklocjx",
   "km2byzkldn2tkmmc9pkmxbydkowc42kpjc2pkpvbyfkq5c0gkq6bxvkojcc0kqhn13kqwn1dl4t158kqunxskqsoqgkrnpxv",
   "kt3kurktmhrzku5pi9ku7ph6ku8pi5kuyn13kvgn0vkvpn05kvpn0dkw4n13kxya05kw6n1gkw7n13kxicy8ky4c4xkylb3h",
   "kxdpjnkyofh8kybnonkywphxl0oodml38fywl4v8y2l3xfpql3qg1nl4u9mwl3sg2kl3wg01l3fjwkl4ob8xl52a5ql4bg09",
   "l3ponwl3roo3l3rontl57ftil55n1nl6rclhl79bc4l9rbualfa2vclayb5alayb58l91picl9vn3kl9yn3qlb0l69larnf7",
   "ld39j9ldj97hldj97alegbndlf39w1lfa906letbnvlebfe1lg1bqaleqpxtlfmnddlfrnrclg7na5lg9nrulgkn9zlk05vw",
   "lhhh3olj38qnlggobwl9rxq4lhdn9clk7964ll9gsxlj3nzyljeobelk0lh9lmjazulkvn93lkopi6llcno3lm0lbsllvnxd",
   "lmfleolmxn3slnclbrln3n2plpoahelneo3elnon8ylosiyplo2nfrlokld6lobndelopl8klovldolqebb4logo6tlpya38",
   "lp4l8llp4l8oloophslp6natlosqatlpqlgtlptleklq3lgplsh9belpwnsjlqdl8ilsh9belsq8sjlq4phqlqdo5zm0f28l",
   "ls8l1qlsznpllv6aqqlt8nhhlv1chvltyljiludf2qlurl8ilv1ln7lyaa3klv3o70lv5o20lvinb0lvjnb4lw8l7cly1amh",
   "lwal44lx4lo2lx7lo9lymdiylxmlnelpkxrylwwqc4m0694xly4l67lyjmoolykmnzlzwer1lyqnowlzal6blywnp8lzslp5",
   "m05l87m07lsdm0blc4m6y3c7m0hnqem1ilplm1plprm2llq2m2ylpem4tarkm6pf98m2bphnm3xkfbm3zl3ym3tmpmm3jooi",
   "m3xnpkm4in9dmia1k2m45phvm6pdiom4rpgkm60l89m5yoc8m5woojm60oohm6ylovm73ocqm7mocwm9mduqmaw9wfm8xnjf",
   "mb2durm9unikma0phymcyl9rmd5mq8mfy9dgmdaphdmdmoqtmhin47msc2ttmmo9aqmjwn4bmk6n4lmkdmo4mn49idmjertl",
   "mns9cqmlen7xmm0molmmfmnfmm2nk3mo1mq7mpupiimtzedemxsieqn13d9nmyooh8n02icvn8y3vsn1womnn4ikosn8g7vt",
   "njb1obn6anrqn6jnr9n6onrpn8bokcndx7v9nfuj70nh1iwzndhmp7ndlmp1npf2d4ndun24nd6py1ne7n2hnebn2gnebpyn",
   "nf4n2znedqp5negpysnetqpbnexqonnf1qphnfiqnqni4nmoniqnnpnj9nn8npz4janjqnmknjzmrcnjsnnbnk3mrenkcmqf",
   "nkhmrantv319nklmr5nkxno5nlmnnlnn3nm8nnqmrfo074q1o0a4qhnwdj6pnzvn6ro4kms7o6ogq0o7jnp1ob3cexoase3x",
   "oakkewoa9msjoio3yzoegdh3ofwb4kogebpmohg9jqogcdfyoiadzdolakcuomvd3tomzdb9or7cz6osfcseor9mwxp682i3",
   "otqmk4ouapunoucpu4ougpuooxgp84oy0p80oy4p7poy7p75p1xpc4pg22lnp3sljvp7nluzp9sjr8paxer3p9zmi6paflhm",
   "pbpihapc1igupcqgh0pfa9wrpekenopdnnbyprw2h9pgpmkzpuf2hrpjfdmupw32i3ph7rfspmo9tmpj4opapkmml3q3l1zj",
   "q3r1yypsl6x4pppqguq4637npv9qmcq3i600q5g1ylpwkqrspw9th1pw8tgkq4c80gq5t61yq6f5toqff34gqd55utqfy595",
   "qbgehtqek62zqcseexq1lx63qry36zqog52lqmx90oqq35ckqntj4oqngt5kqnpt6aqoath9qoiuabqvmdngqvmfxxr215fm",
   "r2zckur7e5irr2vg5br2lkd4qygvbqr5wd7jraa6qzrc553rr7idbares3omr84cpzr88db9r8dd7arca6gcrcb6gdr7ekcb",
   "rcb6g7rf8e1lr7wkd6rdd69er89lgwrdw6cwrfn67qria51xrb7n32riw5bwrgp8sxrfde0yreyeo4rkr65hrh2f8brp43of",
   "rpd3ntrhoeskrhxesqrceu8brlw6q5rps4lqrpb50ers03ntrr04jzrru4o4rf9eaprth6lvrtz6elrug5z2rtv6njru76bh",
   "ruz6aurv36fwrwc5bpryt3z3rsme6drxa5fgry55gkry65hsrzy4ijryy5bwryu5etrujdgyrnzuzrryl6i2rzv5eqryt6f6",
   "rzz5has0f5mbs0s5mbs2q4bts1k57ks1p587s1c5n8s1q5css2c50fs5b3gss5d3h2s2i56os2k5cws2r5ems305kss3e56m",
   "s375kts3m5los4j59fryzj3bs3j6kes5o4uks545dss575eps3j7fgrt8vkkru6vfds6f5axs6k5c0s6u5cbs6x5bhs1cgw5",
   "s6z5das7d5bns7k5cmrzyq06sa840js7d6evs7l6kas59bbxs7d7dcs905nms9g5ebs8y65dsah5fws9u6wgsae68jsbj5cj",
   "sbn65dsbh6ntseh49hsd85b5seo4absew50is84lv6se56pwsf85pxsfg5kysfk5ofset75oseu750sgi5krsh257psgv5de",
   "sho52csdmdgksim5l5sj05mtsju5e2sjd6hssk26m3sj18xqslp5k7skp6rnsn64knsiyal6sn54p1smh6a8so65nrsjofd8",
   "snl6rnsng6z0sof63usqb5b2sql6zvsva3ifst157dstx5kzsxj3g7st46k5su15ttsub5l0stb6oxsuf653sv95jnsuo6oe",
   "sw45j8swv575svx6cpswo5yksvq72gsx35odsw072pswa6rat0n3jzszh5vdszf64zsz56smt0c5x7swug6vt364wdt2m6n6",
   "t515ewt0dhz1t4y6gst5s5xlt9q3sbt6m64xt6m64xt6r70ot7s68vt7s68vt9p4qjtab4iyt8d6hgtai4jat73ar8ti32hl",
   "t9r8nstd45rrt5ws0wtc78tkteg5sltfv4u5te56hvte56hvtdf8rtteq8jotfw7l2tfy7fjtg57lotgy6csthn7iytih6pu",
   "tie6tttid6yltjt6w2tkf6dhtlh5vbtkx7mztpj42ztme73xtmq74qtn16ovtmq74qtql3ydtri3hxtoa7mptmhf1ftq667c",
   "tqe7mktp0bc3tv03vrtrc7qbtuy699tuz6q2tye3wqtys3yotwi5r7tx45wntwl7ictx96ubtx37zlty06mltxx7lpu652j1",
   "tx4aj8ty57z2tyo7gztyi7y1tz17jntzb7jmu056xbu057bnu304fntzj9xeu0v7h2tzv9ovu127fdu07aa8u1n77su962jd",
   "u613nwu2774zu0raa9u217fiu35705u6j43ru446hau5a5pqu4r6qyu5l5yhu6h5uou56926u6a79pu657h7u5u8bpu6g73z",
   "ua53spull978u6s7ddum199pu6l8bqu7m6rnu8l5mou7s6wqu905fwu4anumu4enu6uad8vqu8n6uwue13ghu9v7drudv3w5",
   "uac7diuf13rvuaw6y8ufo381ub86muub279yuer3vyudd51gubn77suf93umufc3vjufy3tfud46bqudw5mmucn7geue45mi",
   "uapdo7ud6746ud87b3udy6f1uhp3twuib3sruei7kzueo7gjuio3swufh6zqufl7jlujl44fuhg6afuja4meugk9sgul43oq",
   "ujr4lpuhs7b6uhz7h4uewpieui5lcgujzac6ulkcspuk4jaaunp71muo071gv2xc12ushbu0umtcu1ulfjafv38c24uth3gl",
   "utb3keure4s3uppasluql6nguppasluvq3b5uuxblquw23f1usv6hdujzac6urpas9urlbawuu873gv102pkuyd4kav053s1",
   "v4i2lpv7m2dwv116wlv314vcv2xc12v38c24v4t4hqv4u4hmv3j6j7v3c6lev3t6kov466h3v536b6v664zwv2xc12vb32nv",
   "v38c24v704zev5z6lqv9m3mcv9r3m9v2xc12v38c24vai3n1v6nabev4qgvivb53n4vaw45rvc93rsvce3smvbo4b7v83a5w",
   "v6ii2bv6mi3hva46gnvdb3o8v6vi2fv7dgbtvau6l4vbd6jxvalc13vfc3dcv72qvfv9gqhtvi73myv9xqvovj73gzvjr3eh",
   "vl03gnvix5dbvm63mkve0rh8vq039svkaemwvn66r5vkblucvkqlu5vm7fj5vlhkcpvqc5cbvu436gvpoc1ovux38uvqidf9",
   "vrth86vsdhldvxv3vbvwm53vvyw3vjvy24pqvxn60dvyj58xvvhiwavvjiwcw1n3sxw1k4taw1r4tzw5m3c6w8a36pw1cm8x",
   "w3x9w4w7s3u0w7f4upwbl3gvwcc36ew9n5zzw7diht------w8pjd3wcqao3w9vkcpwfe3sxwbaqx3wk03q2wcjmd8wgx54o",
   "wj757vwhsdiowmc3ikwhxdijwjn7g1wifgqbwhsj99wkwa7fwp04x7wrd378woob0uwkfv8ewkiv8hwkov7xwpib0cwqsb0w",
   "wsh4vtwu147jwrebsuwuu4j8wty63nwvt4wcwwk83gwurl09wuyl14wu5rgbwzi4wrwzna4fwz3cimwzna4fwz0ir2x2f7qo",
   "x0dlkmx424s0x1wi3ix2xb8dx34b0fx5s4hvx2ei2ax2sk6nx53jxex797ggx58nf0x5dneqx94531x5inevx6sgdix7wcff",
   "x95as6xb98k0x9v8s7x8ykkaxd844kxbhad6xbjadhxdg4mpxafkcxxbbdeqxejamqxa3ps9xc18soxeh4wqxejamqxejamq",
   "xfy4tuxgwan1xgh62uxgl62lxemgzyxh460uxdjpgkxdqpgcxe6pg5xffet6xe4pgkxi64x3xhu5z0xfyevwxhmahrxk14uh",
   "xiv8sjxkn4u8xkb61nxrwf76xki61jxlo4mmxl55vxxm44ydxkuaegxkae85xkge82xl6ae4xml5wkxlcci7xoa4sxxmaedr",
   "xljs6yxpa5x5xpv4tkxp9620xq24thxqx4v8xqsjlixrg8suxsxcx5xt9cv8xuo526xt6f6cxvd5q2xw45ovxummo1xxv484",
   "xwwn5hy064u2y1a4omy1d4ocy22bzly1c5ujxs0ae7y1p91oy1hij0y15moiy1amoay3t56wy4g4xfy6050qy654y1y49hxk",
   "y6e517y6m4zly4ok8cy7c47wy4ymd0y5fm83y57p8ty8s49fyb24ilyadmm6ydqpc1ycwa4xyczdxeydtb80ygf46uyf7aot",
   "yfhaphygi4z2yfi9bjyelpbhyfyasmyg4attyg8b92yhk4ymyhiagjygmls7ygtlrtygtlriyjs4ylyi9gd4ykr45pylg4yi",
   "yk5nefykjmdhykzjs1yo3ltoyoaml5yqy4clyqfi5gysk4dqys6bicytmdb0yubjujyufkqjyvan10ywk9heyvyn0vyw6n0o",
   "ywen06ywfn40ywpm65ywxm5yyz3435yzn534yy4i1wyz0fy4yybk25yydk1ryyjk1pyzf9jryzajmdz0qdkjz0klgdz0vlv3",
   "z1t9i5z11lv1z16n2rz1qm8nz35m8dz3pfmlz4cksrz7j4g4z5peepz7o4g4z6v4fqz7h4fpz7v9qez8nc8fz9qfawzby8zw",
   "zbum8wzc3hf8zc3m84zd0as2zde4x5zd5h3cze84irzepm7wzesm8azevm88zga4b8zgph11zgmneazgsnehzhgdi0zhch08",
   "zhldimzj0mzmzjgmz6zmi9f1znrcedzojcepzolhjczomhjkzoqcdmzoqcdfzojok1zoohj2zonhjfzozcdezovhjbzp4al6",
   "zscfbnzsgcbrzsgcbrzwsc71zxtalfzxxsk3zysmhmzz7jdhzzvojg005ojp008okd009ok300gok100ziwe00ziwo017owk",
   "01wlbg02dlbv02flbi02k4rg02vl6y0334yl03gl7a03rflp05rhzg05uh98",
].join( "" );

const AAP_CATALOG_M = [
   "8d3meiwc4hu2kjznoaol8cp0mypiezqibbjrquhb1hr3bd4gpzaeaopfgh6hsa0gqup6jhlzp1jpaiqfuhcmw8zkflrgxf8l",
   "riperkrhzekvpkdcqvr2gdelr3tdi2rwrd7wqxde7brf9eaprsme6ds4sg4ftznmjlrm3d0xulkpp8wicdd412hq9412fq68",
   "2cho4q41xqjr986mv88eoott8t3oid87up65wamroqik1tm7a5eduk8drgx78dzgy2d0clxm5oqmtjbjmf1dbexf3qccdgul",
   "iqtjllakfgbsk8wrfsz4cubgjtnlmtsdkbwkti0bt2swyo1bsc8olsixykd3j1ukbuj3bkb6ijqiw7pj3bz7jw9qeljf2mc4",
   "gz1km9h08kljda7kd1izjcngrs9bj3s2wbjituelr7vc4fhqvh1fh02f1l5nu5hdm52k3sbc42fhzw8o3i0k83rd3fofcdek",
   "ew0vt9ewavxokfbc0zimkkksimvlmzinlkl7irrkh7isskvtiw3kieix5kmrivwkwdpxfqmkbm1d89j9tq82g3kkc9g63kd3",
   "gvbt04icfkzaigykvsikml5wl2wsvamnut5h2c1u4qj00fobg72kilih2rgkotafe0gsdt4uhxusoa10cqc4",
].join( "" );

// Returns { ra, dec } in degrees for names like "NGC 1514", "IC434", "M 31",
// or null if the name is not a catalog designation.
function aapCatalogLookup( name )
{
   let m = /^\s*(NGC|IC|MESSIER|M)\s*0*(\d{1,4})\s*$/i.exec( String( name ) );
   if ( !m )
      return null;
   let prefix = m[1].toUpperCase();
   let table = ( prefix == "NGC" ) ? AAP_CATALOG_NGC : ( ( prefix == "IC" ) ? AAP_CATALOG_IC : AAP_CATALOG_M );
   let n = parseInt( m[2], 10 );
   if ( !( n >= 1 && n*6 <= table.length ) )
      return null;
   let entry = table.substr( ( n - 1 )*6, 6 );
   if ( entry.charAt( 0 ) == "-" )
      return null;
   return {
      ra: parseInt( entry.substr( 0, 3 ), 36 )/46656*360,
      dec: parseInt( entry.substr( 3, 3 ), 36 )/46655*180 - 90
   };
}

// The standard ImageSolver script, used as a library for plate solving. It is
// included here, after all of this script's own code, so that its macros and
// definitions cannot interfere with it.
#define USE_SOLVER_LIBRARY true
#define SETTINGS_MODULE "AutoAlignmentProSolver"
#define STAR_CSV_FILE   File.systemTempDirectory + "/stars.csv"

#include "../src/scripts/ImageSolver/ImageSolver.js"

aapMain();
