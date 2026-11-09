function gc_ml(method, varargin)
% GC_ML  GAIN CONTROL perception console, lab version: MULLER-LYER ILLUSION (PS 327 Lab 02)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Müller-Lyer, F. C. (1889). Optische Urtheilstäuschungen. Archiv für Anatomie und Physiologie,
%   Physiologische Abtheilung, Supplement-Band, 263-270.
%
%   gc_ml('estimation')  magnitude estimation, oblique lines, fins in (<->) or out (>-<), two colour schemes
%   gc_ml('adjust')      stretch a fins-in line (right) to match a 100 px fins-out standard (left):
%                        UP/DOWN length, LEFT fine (1 px), RIGHT coarse (5 px), SPACE accept
%   gc_ml('pse')         constant stimuli: fins-in test 100-140 px vs the standard; D left longer, K right longer
%   Add 'quick' for half the blocks. Escape quits (data so far are saved). Needs Psychtoolbox-3.
%   Output: data/ml_<method>_<participant>_<date>.csv (same columns as the console's CSVs)

% ---- your setup ----
screenNumber = max(Screen('Screens'));
SCALE = 2;              % original lab pixels -> screen pixels (the console uses 2)
skipSyncTests = false;

if nargin < 1, method = 'pse'; end
quick = any(strcmpi(varargin, 'quick'));
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('ml_%s_%s_%s.csv', method, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w');

PsychDefaultSetup(2); KbName('UnifyKeyNames');
if skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', screenNumber, [0 0 0]);
    [cx, cy] = RectCenter(rect); Screen('TextSize', win, 26); HideCursor;
    pw = 4 * SCALE / 1.5;
    switch method
        case 'estimation'
            fprintf(fid, 'block,line_length,arrow_angle,color_cond,estimate\n');
            nB = 4; if quick, nB = 2; end
            cols = struct('bg', {[64 64 64] / 255, [128 128 0] / 255}, 'line', {[1 1 1], [1 1 .25]}, 'arrow', {[1 1 .25], [1 1 1]});
            msg(win, 'Lines with arrowheads or tails flash for a second.\nType a number for how long each LINE looked, where the standard is 100.\nJudge the line, not the fins.\n\nSPACE to start.');
            standard();
            for b = 1:nB
                [LL, AA, CC] = ndgrid(70:10:130, [45 135], 1:2); conds = [LL(:) AA(:) CC(:)]; conds = conds(randperm(size(conds, 1)), :);
                for i = 1:size(conds, 1)
                    c = cols(conds(i, 3)); Screen('FillRect', win, c.bg);
                    drawLine(win, cx, cy, conds(i, 1), 45, 30, conds(i, 2), 0, pw, c.line, c.arrow, SCALE);
                    Screen('Flip', win); WaitSecs(1); Screen('Flip', win); WaitSecs(1);
                    est = typeNumber(win, 'Your estimate? (The standard is 100.)', cy);
                    fprintf(fid, '%d,%d,%d,%d,%g\n', b, conds(i, 1), conds(i, 2), conds(i, 3), est);
                end
                if b < nB, standard(); end
            end
        case 'adjust'
            fprintf(fid, 'block,start_length,match_length\n');
            nB = 3; if quick, nB = 2; end
            msg(win, 'Make the RIGHT line look as long as the LEFT one.\n\nUP / DOWN: longer / shorter.  LEFT: fine (1 px).  RIGHT: coarse (5 px).  SPACE accepts.\n\nSPACE to start.');
            for b = 1:nB
                for L0 = Shuffle([80 100 120])
                    L = L0; stp = 5; jit = (rand * 2 - 1) * 100;
                    while true
                        drawLine(win, cx, cy, 100, 90, 30, 135, -100 * SCALE / 2 + jit, pw, [0 1 0], [1 1 1], SCALE);
                        drawLine(win, cx, cy, L, 90, 30, 45, 100 * SCALE / 2 + jit, pw, [0 1 0], [1 1 1], SCALE);
                        Screen('Flip', win);
                        k = waitKey({'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow', 'space'});
                        switch k
                            case 'space', break;
                            case 'UpArrow', L = L + stp;
                            case 'DownArrow', L = max(10, L - stp);
                            case 'LeftArrow', stp = 1;
                            otherwise, stp = 5;
                        end
                    end
                    fprintf(fid, '%d,%d,%d\n', b, L0, L);
                end
            end
        otherwise % 'pse'
            fprintf(fid, 'block,test_length,test_longer\n');
            lens = 100:5:140; nB = 8; if quick, nB = 4; end
            msg(win, 'Which line looks longer? D for the left one, K for the right one.\n\nSPACE to start.');
            resp = zeros(numel(lens), 2);
            for b = 1:nB
                for L = Shuffle(lens)
                    jit = (rand * 2 - 1) * 100;
                    drawLine(win, cx, cy, 100, 90, 30, 135, -50 * SCALE + jit, pw, [0 1 0], [1 1 1], SCALE);
                    drawLine(win, cx, cy, L, 90, 30, 45, 50 * SCALE + jit, pw, [0 1 0], [1 1 1], SCALE);
                    Screen('Flip', win);
                    right = strcmp(waitKey({'d', 'k'}), 'k');
                    fprintf(fid, '%d,%d,%d\n', b, L, right);
                    j = find(lens == L); resp(j, :) = resp(j, :) + [right 1];
                    Screen('Flip', win); WaitSecs(.1);
                end
            end
            p = resp(:, 1) ./ resp(:, 2); k = find(p(1:end - 1) < .5 & p(2:end) >= .5, 1);
            if ~isempty(k), pse = lens(k) + (.5 - p(k)) / (p(k + 1) - p(k)) * 5; fprintf('PSE about %.1f px (illusion %.1f px)\n', pse, pse - 100); end
    end
    msg(win, 'Done. Thank you!', false); WaitSecs(1.5);
catch err
    if ~strcmp(err.identifier, 'gc:quit'), fclose(fid); sca; rethrow(err); end
end
fclose(fid); sca; fprintf('Saved %s\n', fn);

    function standard()
        drawLine(win, cx, cy, 100, 0, 0, 0, 0, pw, [1 1 1], [1 1 1], SCALE);
        DrawFormattedText(win, 'This is 100. SPACE to go on.', 'center', cy + 150, [.7 .7 .7]);
        Screen('Flip', win); waitKey({'space'});
    end
end

function drawLine(win, cx, cy, L, A, aL, aA, hOff, w, lineCol, arrowCol, SCALE)
% PrecomputeLineME: length L (orig px) at angle A (deg), fins aL long at aA (45 = fins in, 135 = fins out)
hl = L / 2 * cosd(A) * SCALE; vl = L / 2 * sind(A) * SCALE;
f = [cx - hl + hOff, cy - vl]; t = [cx + hl + hOff, cy + vl];
Screen('DrawLine', win, lineCol, f(1), f(2), t(1), t(2), w);
if aA
    a = aL * SCALE; ends = {f, A + aA; f, A - aA; t, A + 180 - aA; t, A + 180 + aA};
    for k = 1:4
        o = ends{k, 1}; ang = ends{k, 2};
        Screen('DrawLine', win, arrowCol, o(1), o(2), o(1) + a * cosd(ang), o(2) + a * sind(ang), w);
    end
end
end

function v = typeNumber(win, prompt, cy)
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
