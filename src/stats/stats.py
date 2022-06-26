#! /usr/bin/python3 -u

import curses
import fileinput
import time, datetime

use_ncurses = True

def show_data(stdscr, data, start):
    if use_ncurses:
        height, width = stdscr.getmaxyx()
    else:
        print('-'*40)

    ln = 0
    total_cnt = 0
    max_val = 0
    now = datetime.datetime.now()
    for k in data.keys():
        v = data[k]
        if v > max_val:
            max_val = v
        total_cnt += v

    def output(st, ln):
        if use_ncurses:
            stdscr.addstr(ln, 0, st)
        else:
            print(st)
        
    bar_width = width-52 # See field format below
    for k in sorted(data.keys()):
        v = data[k]
        pcnt = 100.0*v/float(total_cnt)
        bar_rel = float(v)/max_val
        bar_ch = int(bar_width*bar_rel)
        bar = ':'*bar_ch + ' '*(bar_width-bar_ch)
        output('{:4.1f}% {:4} {:40} {}'.format(pcnt, v, k, bar), ln)
        ln += 1
    output('{} requests, {:.1f} requests/s, {} buckets.'.format(total_cnt, total_cnt/(now-start).total_seconds(), ln), ln)
    for padln in range(ln+1,height-1):
        output(' '*width, padln)
    stdscr.refresh()

def read_input(stdscr):
    start = None
    for line in fileinput.input():
        if not start:
            start = datetime.datetime.now()
            data = {}
        line = line.rstrip()
        data[line] = data.get(line, 0) + 1
        show_data(stdscr, data, start)
        now = datetime.datetime.now()
        window = (now-start).total_seconds()
        if window > 30:  # Restart statistics window
            start = None
    time.sleep(100)

if __name__ == "__main__":
    if use_ncurses:
        curses.wrapper(read_input)
    else:
        read_input(None)
