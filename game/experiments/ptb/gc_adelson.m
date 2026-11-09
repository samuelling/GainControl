function gc_adelson(varargin)
% GC_ADELSON  GAIN CONTROL perception console, lab version: ADELSON'S CORRUGATED PLAID (PS 327 Lab 04)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Adelson, E. H. (1993). Perceptual organization and the judgment of brightness. Science, 262(5142), 2042-2044.
%
%   A plaid folded in depth puts the upper test patch on a lit face and the lower on a shadowed one; a
%   control figure has the same local neighbours but no consistent 3D reading (rotated 90 deg). Adjust the
%   LOWER patch until it matches the UPPER one: UP/DOWN lighter/darker, LEFT/RIGHT smaller/bigger steps,
%   SPACE when they match. Upper patch 0.2, 0.4, 0.6, 0.8; 3 blocks per figure ('quick': 1).
%   Grey levels are nominal: load a gamma table if absolute values matter. Escape quits (data so far saved).
%   Output: data/adelson_<participant>_<date>.csv  columns: figure, block, upper_test_lum, lower_match_lum

% ---- your setup ----
screenNumber = max(Screen('Screens'));
S = 1.15;               % size scale (the console's)
skipSyncTests = false;

nBlocks = 3; if any(strcmpi(varargin, 'quick')), nBlocks = 1; end
TESTS = [.2 .4 .6 .8];
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('adelson_%s_%s.csv', participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, 'figure,block,upper_test_lum,lower_match_lum\n');

PsychDefaultSetup(2); KbName('UnifyKeyNames');
if skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', screenNumber, 1);
    Screen('TextSize', win, 24); HideCursor;
    DrawFormattedText(win, 'Adjust the LOWER small patch until it looks the same grey as the UPPER one.\n\nUP / DOWN: lighter / darker.  LEFT / RIGHT: smaller / bigger steps.  SPACE: they match.\n\nSPACE to start.', 'center', 'center', 0);
    Screen('Flip', win); waitKey({'space'});
    for control = Shuffle([0 1])
        for b = 1:nBlocks
            for UT = Shuffle(TESTS)
                LT = randi([0 100]) / 100; stp = .025;
                while true
                    plaid(win, rect, UT, LT, control, S); Screen('Flip', win);
                    switch waitKey({'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow', 'space'})
                        case 'space', break;
                        case 'UpArrow', LT = min(1, LT + stp);
                        case 'DownArrow', LT = max(0, LT - stp);
                        case 'LeftArrow', stp = max(.005, stp - .005);
                        otherwise, stp = min(.1, stp + .005);
                    end
                end
                fig = 'test'; if control, fig = 'control'; end
                fprintf(fid, '%s,%d,%g,%.4f\n', fig, b, UT, LT);
            end
        end
    end
catch err
    if ~strcmp(err.identifier, 'gc:quit'), fclose(fid); sca; rethrow(err); end
end
fclose(fid); sca; fprintf('Saved %s\n', fn);
end

function plaid(win, rect, UT, LT, control, S)
% plaid.m / drawatest / drawacontrol
W = rect(3); H = rect(4); x = 100 * S; y = x / 1.5; z = x / 3; o1 = -z; o2 = z;
L = .8; M = .55; D = .4; DD = .2;
Screen('FillRect', win, 1);
if ~control
    rh = [x y y y x]; cw = [y y y y y]; T = (H - (2 * x + 3 * y)) / 2; Lf = (W - 5 * y) / 2; rot = @(p) p;
    C135 = [M D M D M]; C2 = [L M UT M L]; C4 = [D DD LT DD D];
    t = T; row(t, t + rh(1), Lf, Lf + y, Lf + y, Lf, C135, cw, rot); t = t + rh(1);
    row(t, t + rh(2), Lf, Lf + y, Lf + y + o1, Lf + o1, C2, cw, rot); t = t + rh(2);
    row(t, t + rh(3), Lf + o1, Lf + y + o1, Lf + y + o1, Lf + o1, C135, cw, rot); t = t + rh(3);
    row(t, t + rh(4), Lf + o1, Lf + o1 + y, Lf + o1 + y + o2, Lf, C4, cw, rot); t = t + rh(4);
    row(t, t + rh(5), Lf, Lf + y, Lf + y, Lf, C135, cw, rot);
else
    rh = [y y y y y]; cw = [x y y y x]; T = (H - 5 * y) / 2; Lf = (W - (2 * x + 3 * y)) / 2; cx = W / 2; cy = H / 2;
    rot = @(p) [cx - (p(:, 2) - cy), cy + (p(:, 1) - cx)];
    C1 = [M L M D M]; C2 = [D M D DD D]; C3 = [M UT M LT M];
    t = T; row(t, t + rh(1), Lf, Lf + x, Lf + x, Lf, C1, cw, rot); t = t + rh(1);
    row(t, t + rh(2), Lf, Lf + x, Lf + x + o1, Lf + o1, C2, cw, rot); t = t + rh(2);
    row(t, t + rh(3), Lf + o1, Lf + x + o1, Lf + x + o1, Lf + o1, C3, cw, rot); t = t + rh(3);
    row(t, t + rh(4), Lf + o1, Lf + o1 + x, Lf + o1 + x + o2, Lf, C2, cw, rot); t = t + rh(4);
    row(t, t + rh(5), Lf, Lf + x, Lf + x, Lf, C1, cw, rot);
end
    function row(top, bottom, tl, tr, br, bl, cols, widths, rot)
        % drawpolygons: one row of parallelograms, each column advancing by its width
        for i = 1:numel(cols)
            p = rot([tl top; tr top; br bottom; bl bottom]);
            Screen('FillPoly', win, cols(i), p, 1); Screen('FramePoly', win, cols(i), p, 1);
            if i < numel(cols), tl = tl + widths(i); tr = tr + widths(i + 1); br = br + widths(i + 1); bl = bl + widths(i); end
        end
    end
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
