function gc_rivsetup(varargin)
% GC_RIVSETUP  GAIN CONTROL perception console, lab version: RIVALRY VIEWING SETUP
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Wheatstone, C. (1838). Contributions to the physiology of vision. Part the first. On some remarkable, and hitherto
%     unobserved, phenomena of binocular vision. Philosophical Transactions of the Royal Society of London, 128, 371-394.
%   Blake, R. (2001). A primer on binocular rivalry, including current controversies. Brain and Mind, 2(1), 5-38.
%
%   Checks the viewing before the rivalry scripts. Anaglyph: a word for each eye (close one eye, then the other: each
%   should see only its own; a ghost of the other is crosstalk), then two half-discs to match in brightness (LEFT dims
%   the green eye's, RIGHT brightens it; ENTER when they match). Split: fusion frames and nonius lines (LEFT closer,
%   RIGHT apart, ENTER when the frames fuse and the lines meet). It prints the values to copy into the settings of the
%   other rivalry scripts, and ends on a demonstration of rivalry.
%
%   Output: data/rivsetup_<participant>_<date>.csv  columns: setting, value
%
%   Viewing: set V.view below. 'anaglyph' uses Psychtoolbox's anaglyph stereo mode (6) for red/green or red/cyan glasses,
%   with the gains set per eye; 'split' uses side-by-side mode (4) for a mirror or prism stereoscope. Run gc_rivsetup
%   first to check for crosstalk and to match the eyes' brightness. Both eyes share a frame of squares and a fixation dot.
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

% ---- viewing: how each eye gets its own picture (Psychtoolbox's own stereo modes) ----
V.view = 'anaglyph';   % 'anaglyph': red/green (or red/cyan) glasses (stereoMode 6); 'split': side by side, for a stereoscope (stereoMode 4)
V.redEye = 'left';     % anaglyph: the eye behind the red filter
V.redGain = 1; V.greenGain = .85;   % anaglyph: match the eyes' brightness through the glasses (gc_rivsetup finds them)
V.mirrorLeft = false;  % split: mirror-reverse the left half, for single-mirror stereoscopes
V.eyeDeg = 12.8;       % each eye's square picture, in degrees

[E, fid, fn] = rivOpen('rivsetup', 'setting,value', S, V);
try
    if strcmp(V.view, 'anaglyph')
        for eye = 0:1
            rivEye(E, eye, 0); words = {'LEFT EYE', 'RIGHT EYE'}; Screen('TextSize', E.win, round(E.n / 10));
            DrawFormattedText(E.win, words{eye + 1}, 'center', E.cy + (eye - .5) * E.n * .28, 1);
        end
        Screen('TextSize', E.win, 22); Screen('Flip', E.win);
        fprintf('Close one eye, then the other: each should see only its own word. SPACE to go on.\n'); waitKey({'space', 'Return'});
        rr = nom(120) * E.ppd; red = V.redGain; green = V.greenGain;
        while true
            if strcmp(V.redEye, 'left'), lg = [red 0 0]; rg = [0 green 0]; else, lg = [0 green 0]; rg = [red 0 0]; end
            SetAnaglyphStereoParameters('LeftGains', E.win, lg); SetAnaglyphStereoParameters('RightGains', E.win, rg);
            redIsLeft = strcmp(V.redEye, 'left');
            for eye = 0:1
                rivEye(E, eye, 0); isRed = (eye == 0) == redIsLeft; r = CenterRectOnPoint([0 0 2 2] * rr, E.cx, E.cy);
                if isRed, Screen('FillArc', E.win, 1, r, 180, 180); else, Screen('FillArc', E.win, 1, r, 0, 180); end
                DrawFormattedText(E.win, sprintf('LEFT/RIGHT: match the half-discs. ENTER when equal. GREEN %d%%  RED %d%%', round(green * 100), round(red * 100)), 'center', E.rect(4) - 40, 1);
            end
            Screen('Flip', E.win);
            k = waitKey({'LeftArrow', 'RightArrow', 'Return'}); if strcmp(k, 'Return'), break; end
            if strcmp(k, 'RightArrow')
                if green < 1, green = min(1, green + .03); else, red = max(.3, red - .03); end
            else
                if red < 1, red = min(1, red + .03); else, green = max(.3, green - .03); end
            end
        end
        fprintf(fid, 'redGain,%.2f\ngreenGain,%.2f\n', red, green);
        fprintf('Copy into the rivalry scripts: V.redGain = %.2f; V.greenGain = %.2f;\n', red, green);
    else
        % side by side: Psychtoolbox places each view in its own half of the screen; adjust the stereoscope until
        % the frames fuse and the two short lines meet
        for eye = 0:1
            rivEye(E, eye); rivLock(E, false); h = max(1, round(nom(2) * E.ppd)); a = round(nom(6) * E.ppd); b = round(nom(60) * E.ppd);
            if eye == 0, Screen('FillRect', E.win, 0, [E.cx - h, E.cy - b, E.cx + h, E.cy - a]); else, Screen('FillRect', E.win, 0, [E.cx - h, E.cy + a, E.cx + h, E.cy + b]); end
            Screen('FillRect', E.win, 0, [E.cx - round(nom(30) * E.ppd), E.cy - h, E.cx + round(nom(30) * E.ppd), E.cy + h]);
        end
        Screen('Flip', E.win);
        fprintf('Adjust the stereoscope until the frames fuse and the two short lines meet in one line. SPACE when they do.\n'); waitKey({'space', 'Return'});
        fprintf(fid, 'view,split\n');
    end
    tA = rivGrating(E, nom(54), 0, 3, -45, .8); tB = rivGrating(E, nom(54), 0, 3, 45, .8);
    for eye = 0:1, rivEye(E, eye); drawPair(E, eye, tA, tB); rivLock(E); end
    Screen('Flip', E.win); fprintf('Rivalry: one grating, then the other. SPACE to finish.\n'); waitKey({'space', 'Return'});
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
end

% ---------------- shared helpers ----------------
function [win, rect, cx, cy, ppd, ifi, fid, fn] = gcOpen(id, header, bg, S)
% participant ID, data file (data/<id>_<participant>_<date>.csv), window, pixels per degree, frame interval
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('%s_%s_%s.csv', id, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, '%s\n', header);
PsychDefaultSetup(2); KbName('UnifyKeyNames');
if S.skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
[win, rect] = PsychImaging('OpenWindow', S.screenNumber, bg);
Screen('BlendFunction', win, 'GL_SRC_ALPHA', 'GL_ONE_MINUS_SRC_ALPHA');
[cx, cy] = RectCenter(rect); ppd = rect(3) / S.screenWidthCm * 2 * S.viewDistCm * tand(.5); ifi = Screen('GetFlipInterval', win);
Screen('TextSize', win, 24); HideCursor;
end

function gcClose(fid, fn, err)
% close the file and the screen; rethrow anything but Escape
fclose(fid); sca; ShowCursor;
if nargin > 2 && ~isempty(err) && ~strcmp(err.identifier, 'gc:quit'), rethrow(err); end
fprintf('Saved %s\n', fn);
end

function tex = gaborTex(win, c, sfCpd, oriDeg, ppd, sizeDeg, sdDeg, bg)
% a Gabor on grey bg (0-1) as a float texture; ori 0 = vertical stripes, positive = clockwise; random phase
n = round(sizeDeg * ppd); [x, y] = meshgrid((1:n) - n / 2); th = oriDeg * pi / 180;
env = exp(-(x .^ 2 + y .^ 2) / (2 * (sdDeg * ppd) ^ 2));
L = bg * (1 + c * env .* sin(2 * pi * sfCpd / ppd * (x * cos(th) + y * sin(th)) + rand * 2 * pi));
tex = Screen('MakeTexture', win, min(1, max(0, L)), [], [], 2);
end

function msg(win, text, col, wait)
if nargin < 3 || isempty(col), col = [1 1 1]; end
if nargin < 4, wait = true; end
DrawFormattedText(win, text, 'center', 'center', col, 90); Screen('Flip', win);
if wait, waitKey({'space', 'Return'}); end
end

function [k, rt] = waitKey(names, t0, maxWait)
% wait for one of the named keys (KbName names); Escape quits. rt from t0 (GetSecs). k = '' after maxWait seconds
if nargin < 2 || isempty(t0), t0 = GetSecs; end
if nargin < 3, maxWait = inf; end
codes = zeros(1, numel(names)); for i = 1:numel(names), c = KbName(names{i}); codes(i) = c(1); end
esc = KbName('ESCAPE'); KbReleaseWait;
while GetSecs - t0 < maxWait
    [down, secs, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit), k = names{hit}; rt = secs - t0; return; end
    end
    WaitSecs(0.001);
end
k = ''; rt = NaN;
end

function a = twoIFC(win, cx, cy, drawFn, ifi, dur, isi, col)
% two numbered intervals; drawFn(i) draws interval i's stimulus. Returns the interval chosen (1 or 2)
if nargin < 6, dur = .2; end
if nargin < 7, isi = .5; end
if nargin < 8, col = 0; end
for i = 1:2
    DrawFormattedText(win, num2str(i), 'center', cy - 240, col); Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]);
    vbl = Screen('Flip', win);
    drawFn(i); DrawFormattedText(win, num2str(i), 'center', cy - 240, col);
    vbl = Screen('Flip', win, vbl + isi - .5 * ifi);
    Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]); Screen('Flip', win, vbl + dur - .5 * ifi);
end
k = waitKey({'1!', '2@', '1', '2'}); a = k(1) - '0';
end


% ---------------- rivalry helpers ----------------
function [E, fid, fn] = rivOpen(id, header, S, V)
% the data file, and a stereo window through Psychtoolbox's own stereo modes: E has the window and each eye's square
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('%s_%s_%s.csv', id, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, '%s\n', header);
PsychDefaultSetup(2); KbName('UnifyKeyNames');
if S.skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
PsychImaging('PrepareConfiguration');
sm = 6; if strcmp(V.view, 'split'), sm = 4; end
if sm == 4 && V.mirrorLeft, PsychImaging('AddTask', 'LeftView', 'FlipHorizontal'); end
[win, rect] = PsychImaging('OpenWindow', S.screenNumber, 0, [], [], [], sm);
if sm == 6
    red = [V.redGain 0 0]; green = [0 V.greenGain 0];
    if strcmp(V.redEye, 'left'), lg = red; rg = green; else, lg = green; rg = red; end
    SetAnaglyphStereoParameters('LeftGains', win, lg); SetAnaglyphStereoParameters('RightGains', win, rg);
end
Screen('BlendFunction', win, 'GL_SRC_ALPHA', 'GL_ONE_MINUS_SRC_ALPHA'); Screen('TextSize', win, 22); HideCursor;
sr = Screen('Rect', S.screenNumber);   % pixels per degree from the whole screen (side by side, each eye's view is half of it)
E.ppd = sr(3) / S.screenWidthCm * 2 * S.viewDistCm * tand(.5);
E.win = win; E.rect = rect; [E.cx, E.cy] = RectCenter(rect); E.ifi = Screen('GetFlipInterval', win);
E.n = 2 * floor(min([V.eyeDeg * E.ppd, rect(3) - 10, rect(4) - 10]) / 2);
end

function px = nom(p)
% the console draws at a nominal 36 px per degree: its pixel sizes, in degrees
px = p / 36;
end

function rivEye(E, eye, bg)
% start one eye's picture (0 left, 1 right): select its buffer, a grey square
if nargin < 3, bg = .5; end
Screen('SelectStereoDrawBuffer', E.win, eye);
Screen('FillRect', E.win, bg, CenterRectOnPoint([0 0 E.n E.n], E.cx, E.cy));
end

function rivLock(E, fix)
% what both eyes share, so the pictures lock together: black and white squares round the edge, and a fixation dot
if nargin < 2, fix = true; end
s = max(4, round(nom(12) * E.ppd)); x0 = E.cx - E.n / 2; y0 = E.cy - E.n / 2; k = 0:ceil(E.n / s) - 1; p = k * s;
q = min(p + s, E.n);
rects = [x0 + p, x0 + p, x0 + zeros(size(p)), x0 + (E.n - s) * ones(size(p)); ...
    y0 + zeros(size(p)), y0 + (E.n - s) * ones(size(p)), y0 + p, y0 + p; ...
    x0 + q, x0 + q, x0 + s * ones(size(p)), x0 + E.n * ones(size(p)); ...
    y0 + s * ones(size(p)), y0 + E.n * ones(size(p)), y0 + q, y0 + q];
v = repmat(double(mod(k, 2) == 0), 1, 4); Screen('FillRect', E.win, [v; v; v], rects);
if fix
    a = max(2, round(nom(4) * E.ppd)); b = max(1, round(nom(2) * E.ppd));
    Screen('FillRect', E.win, 0, CenterRectOnPoint([0 0 2 * a 2 * a], E.cx, E.cy));
    Screen('FillRect', E.win, 1, CenterRectOnPoint([0 0 2 * b 2 * b], E.cx, E.cy));
end
end

function tex = rivGrating(E, r, r0, cpd, ori, c, kind)
% a sine grating in a soft-edged circular (or annular) aperture, as a float texture with alpha; r, r0 in degrees.
% ori: the direction the phase runs, degrees clockwise from rightward (45: stripes tilted right, -45: left, 0: vertical).
% kind: 'linear', 'radial' or 'concentric'
if nargin < 7, kind = 'linear'; end
rp = r * E.ppd; r0p = r0 * E.ppd; ep = max(1, nom(3) * E.ppd); m = ceil(rp) * 2 + 2;
[x, y] = meshgrid((0:m - 1) + .5 - m / 2); d = hypot(x, y); f = cpd / E.ppd * 2 * pi; th = ori * pi / 180;
switch kind
    case 'radial', ph = atan2(y, x) * max(4, round(2 * pi * (rp + r0p) / 2 / E.ppd * cpd));
    case 'concentric', ph = d * f;
    otherwise, ph = (x * cos(th) + y * sin(th)) * f;
end
L = .5 + .5 * c * sin(ph);
if r0p > 0, a = min(rp - d, d - r0p) / ep; else, a = (rp - d) / ep; end
tex = Screen('MakeTexture', E.win, cat(3, L, L, L, min(1, max(0, a))), [], [], 2);
end

function rivPut(E, tex, dx, dy, alpha, part)
% draw a texture centred dx, dy degrees from the middle (dy down); part = [l t r b] of the texture, in its own pixels
if nargin < 3, dx = 0; end
if nargin < 4, dy = 0; end
if nargin < 5, alpha = 1; end
tr = Screen('Rect', tex); if nargin < 6 || isempty(part), part = tr; end
c = [E.cx + dx * E.ppd, E.cy + dy * E.ppd] - tr([3 4]) / 2;
Screen('DrawTexture', E.win, tex, part, part + [c c], [], [], alpha);
end

function rivMsg(E, text)
% a message in both eyes; SPACE or ENTER goes on
for eye = 0:1, Screen('SelectStereoDrawBuffer', E.win, eye); DrawFormattedText(E.win, text, 'center', 'center', 1, 44); end
Screen('Flip', E.win); waitKey({'space', 'Return'});
end

function full = rivTrack(E, secs, drawFn)
% report percepts continuously (A left tilt, S mixed, L right tilt; press on every change) while drawFn(eye, t) draws
% each eye's stimulus. full: {label, onset_s, duration_s} rows of completed percepts (the last, cut off, left out)
names = {'a', 's', 'l'}; labels = {'LEFT TILT', 'MIXED', 'RIGHT TILT'}; codes = cellfun(@(k) KbName(k), names); esc = KbName('ESCAPE');
full = cell(0, 3); cur = 0; t0 = 0; t = 0; KbReleaseWait; tStart = Screen('Flip', E.win);
while t < secs
    for eye = 0:1
        rivEye(E, eye); drawFn(eye, t); rivLock(E);
        DrawFormattedText(E.win, sprintf('%d S', ceil(secs - t)), E.rect(3) - 70, 30, .45);
    end
    vbl = Screen('Flip', E.win); t = vbl - tStart;
    [down, ~, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit) && hit ~= cur
            if cur, full(end + 1, :) = {labels{cur}, t0, t - t0}; end %#ok<AGROW>
            cur = hit; t0 = t;
        end
    end
end
end

function drawPair(E, eye, texL, texR)
% the left eye's texture to the left eye, the right eye's to the right
if eye == 0, rivPut(E, texL); else, rivPut(E, texR); end
end

function k = rivFirstKey(names)
% the first of these keys down now ('' if none); Escape quits
k = ''; [down, ~, kc] = KbCheck; if ~down, return; end
if kc(KbName('ESCAPE')), error('gc:quit', 'Escape pressed'); end
for i = 1:numel(names), if kc(KbName(names{i})), k = names{i}; return; end, end
end

function s = durStats(ds)
% mean, SD, CV and gamma shape (mean^2 / var) of dominance durations
s.n = numel(ds); s.m = mean(ds); s.sd = std(ds); s.cv = s.sd / s.m; s.k = s.m ^ 2 / s.sd ^ 2;
end
