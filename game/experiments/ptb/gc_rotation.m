function gc_rotation(varargin)
% GC_ROTATION  GAIN CONTROL perception console, lab version: MENTAL ROTATION
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Cooper, L. A., & Shepard, R. N. (1973). Chronometric studies of the rotation of mental images. In W. G. Chase (Ed.),
%     Visual information processing (pp. 75-176). New York: Academic Press.
%
%   A letter (R, F, G or J) rotated 0-300 deg in 60 deg steps, normal or mirror-reversed: N normal, M mirror.
%   gc_rotation   or   gc_rotation('quick')
%   Output: data/rotation_<participant>_<date>.csv  columns: trial, letter, angle, mirror, said_mirror, rt_ms
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('rotation', 'trial,letter,angle,mirror,said_mirror,rt_ms', 0, S);
try
    reps = 10; if quick, reps = 4; end
    [A, M, ~] = ndgrid(0:60:300, 0:1, 1:reps); o = randperm(numel(A)); A = A(o); M = M(o);
    nT = 120; if quick, nT = 48; end
    A = A(1:min(nT, numel(A))); M = M(1:numel(A));
    letters = 'RFGJ'; sz = round(4 * ppd);
    % each letter drawn once into an offscreen window, then shown as a rotated (and maybe mirrored) texture
    tex = zeros(1, 4);
    for i = 1:4
        [ow, orc] = Screen('OpenOffscreenWindow', win, 0, [0 0 sz * 1.4 sz * 1.4]);
        Screen('TextSize', ow, round(sz)); Screen('TextStyle', ow, 1); Screen('TextFont', ow, 'Arial');
        DrawFormattedText(ow, letters(i), 'center', 'center', [.83 .8 1], [], [], [], [], [], orc); tex(i) = ow;
    end
    msg(win, 'A letter appears, rotated. Normal letter: N.  Mirror image: M.\nAs fast as you can without mistakes.\n\nSPACE to start.');
    for t = 1:numel(A)
        li = randi(4); Screen('FillRect', win, 1, CenterRectOnPoint([0 0 6 6], cx, cy)); Screen('Flip', win); WaitSecs(.5);
        dst = CenterRectOnPoint([0 0 sz * 1.4 sz * 1.4], cx, cy);
        if M(t), Screen('glPushMatrix', win); Screen('glTranslate', win, cx, cy); Screen('glScale', win, -1, 1); Screen('glTranslate', win, -cx, -cy);
            Screen('DrawTexture', win, tex(li), [], dst, -A(t)); Screen('glPopMatrix', win);
        else, Screen('DrawTexture', win, tex(li), [], dst, A(t)); end
        t0 = Screen('Flip', win); [k, rt] = waitKey({'n', 'm'}, t0);
        fprintf(fid, '%d,%s,%d,%d,%d,%.1f\n', t, letters(li), A(t), M(t), strcmp(k, 'm'), rt * 1000);
        Screen('Flip', win); WaitSecs(.3);
    end
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
