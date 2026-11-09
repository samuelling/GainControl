function gc_hv(varargin)
% GC_HV  GAIN CONTROL perception console, lab version: HORIZONTAL-VERTICAL ILLUSION (PS 327 Lab 01)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Fick, A. (1851). De errore quodam optico asymmetria bulbi effecto. Marburg: J. A. Koch.
%   Stevens, S. S. (1957). On the psychophysical law. Psychological Review, 64(3), 153-181.
%
%   Magnitude estimation of line length. A standard horizontal line is 100; each test line (70-130 px,
%   horizontal or vertical) flashes for 1 s, then you type a number for how long it looked. Vertical
%   lines usually get bigger numbers than horizontal ones of the same length.
%
%   gc_hv            full version (4 blocks)      gc_hv('quick')   2 blocks
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.
%   Output: data/hv_<participant>_<date>.csv  columns: block, line_length, line_angle, estimate
%   Lengths are the original lab's pixel values times SCALE.

% ---- your setup ----
screenNumber = max(Screen('Screens'));
SCALE = 2;              % original lab pixels -> screen pixels (the console uses 2)
skipSyncTests = false;

P.standard = 100; P.lengths = 70:10:130; P.angles = [0 90]; P.nBlocks = 4; P.pen = 4; P.trialS = 1; P.blankS = 1;
if any(strcmpi(varargin, 'quick')), P.nBlocks = 2; end

participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('hv_%s_%s.csv', participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, 'block,line_length,line_angle,estimate\n');

PsychDefaultSetup(2); KbName('UnifyKeyNames');
if skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', screenNumber, [0 0 0]);
    [cx, cy] = RectCenter(rect); Screen('TextSize', win, 28); HideCursor;
    msg(win, 'A line flashes for a second, horizontal or vertical.\n\nThe standard line counts as 100. After each line, type a number\nfor how long it looked: twice as long is 200, half as long is 50.\n\nSPACE to start.');
    showStandard();
    for b = 1:P.nBlocks
        [LL, AA] = ndgrid(P.lengths, P.angles); conds = [LL(:) AA(:)]; conds = conds(randperm(size(conds, 1)), :);
        for i = 1:size(conds, 1)
            drawLine(win, cx, cy, conds(i, 1), conds(i, 2), 20, 0, 0, P.pen * SCALE / 1.5, [1 1 1], [1 1 1], SCALE);
            Screen('Flip', win); WaitSecs(P.trialS);
            Screen('Flip', win); WaitSecs(P.blankS);
            est = typeNumber(win, 'Your estimate? (The standard is 100.)', cx, cy);
            fprintf(fid, '%d,%d,%d,%g\n', b, conds(i, 1), conds(i, 2), est);
        end
        if b < P.nBlocks, showStandard(); end
    end
    msg(win, sprintf('Done. Thank you!\n\nData: %s', fn), false); WaitSecs(2);
catch err
    if ~strcmp(err.identifier, 'gc:quit'), fclose(fid); sca; rethrow(err); end
end
fclose(fid); sca; fprintf('Saved %s\n', fn);

    function showStandard()
        drawLine(win, cx, cy, P.standard, 0, 0, 0, 0, P.pen * SCALE / 1.5, [1 1 1], [1 1 1], SCALE);
        DrawFormattedText(win, 'This is 100. SPACE to go on.', 'center', cy + 150, [.7 .7 .7]);
        Screen('Flip', win); waitKey({'space'});
    end
end

function drawLine(win, cx, cy, L, A, aL, aA, hOff, w, lineCol, arrowCol, SCALE)
% PrecomputeLineME: a line of length L (orig px) at angle A (deg), fins aL long at aA (deg re inward)
hl = L / 2 * cosd(A) * SCALE; vl = L / 2 * sind(A) * SCALE;
f = [cx - hl + hOff, cy - vl]; t = [cx + hl + hOff, cy + vl];
Screen('DrawLine', win, lineCol, f(1), f(2), t(1), t(2), w);
if aA
    a = aL * SCALE;
    ends = {f, A + aA; f, A - aA; t, A + 180 - aA; t, A + 180 + aA};
    for k = 1:4
        o = ends{k, 1}; ang = ends{k, 2};
        Screen('DrawLine', win, arrowCol, o(1), o(2), o(1) + a * cosd(ang), o(2) + a * sind(ang), w);
    end
end
end

function v = typeNumber(win, prompt, cx, cy)
s = '';
while true
    DrawFormattedText(win, prompt, 'center', cy - 60, [.8 .8 .8]);
    DrawFormattedText(win, [s '_'], 'center', cy + 10, [1 1 1]);
    Screen('Flip', win);
    k = waitKey({'0)', '1!', '2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.>', 'BackSpace', 'Return', 'ENTER'});
    switch k
        case {'Return', 'ENTER'}
            if ~isempty(s) && ~strcmp(s, '.'), v = str2double(s); return; end
        case 'BackSpace'
            if ~isempty(s), s(end) = []; end
        case '.>'
            if ~any(s == '.'), s(end + 1) = '.'; end
        otherwise
            if numel(s) < 6, s(end + 1) = k(1); end
    end
end
end

function msg(win, text, wait)
if nargin < 3, wait = true; end
DrawFormattedText(win, text, 'center', 'center', [1 1 1]); Screen('Flip', win);
if wait, waitKey({'space', 'Return'}); end
end

function [k, rt] = waitKey(names, t0)
% wait for one of the named keys (KbName names); Escape quits. rt from t0 (GetSecs) if given
if nargin < 2, t0 = GetSecs; end
codes = zeros(1, numel(names)); for i = 1:numel(names), c = KbName(names{i}); codes(i) = c(1); end
esc = KbName('ESCAPE'); KbReleaseWait;
while true
    [down, secs, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit), k = names{hit}; rt = secs - t0; return; end
    end
    WaitSecs(0.001);
end
end
