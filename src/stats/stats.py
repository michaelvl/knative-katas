#! /usr/bin/python3 -u

import curses
import fileinput
import time

use_ncurses = True

def show_data(stdscr, data):
    if use_ncurses:
        height, width = stdscr.getmaxyx()
        stdscr.clear()
        stdscr.refresh()
    else:
        print('-'*40)

    ln = 0
    total_cnt = 0.0
    max_val = 0
    for k in data.keys():
        v = data[k]
        if v > max_val:
            max_val = v
        total_cnt += v

    def output(st, ln):
        if use_ncurses:
            stdscr.addstr(ln, 0, st)
            stdscr.refresh()
        else:
            print(st)
        
    for k in sorted(data.keys()):
        v = data[k]
        pcnt = 100.0*v/float(total_cnt)
        bar_rel = float(v)/max_val
        bar = ':'*int((width-50)*bar_rel)
        output('{:4.1f}% {:40} {}'.format(pcnt, k, bar), ln)
        ln += 1
    output('{} requests'.format(total_cnt), ln)

def read_input(stdscr):
    data = {}
    for line in fileinput.input():
        line = line.rstrip()
        data[line] = data.get(line, 0) + 1
        show_data(stdscr, data)
    time.sleep(100)

if __name__ == "__main__":
    if use_ncurses:
        curses.wrapper(read_input)
    else:
        read_input(None)
