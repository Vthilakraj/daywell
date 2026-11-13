import { describe, expect, it, beforeEach } from 'vitest';
import { dateKey, finishTimer, freshData, loadData, makeTimer, parseBackup, secondsLeft, shiftDate, STORAGE_KEY, weekDates } from '../src/model';
describe('portable plans', () => {
  beforeEach(() => localStorage.clear());
  it('round trips a complete backup and stops imported timers', () => {
    const data=freshData(); data.name='Sam'; data.tasks=[{id:'task',title:'Read a chapter',date:'2026-11-13',category:'Study',done:true,priority:false}]; data.routines=[{id:'r',title:'Read',days:['2026-11-13']}];data.journal={'2026-11-13':{mood:'good',win:'A quiet hour',tomorrow:'Step outside'}};data.focus={'2026-11-13':25};data.timer={...makeTimer(),endAt:Date.now()+5000};
    const restored=parseBackup(JSON.stringify(data));expect(restored.tasks).toEqual(data.tasks);expect(restored.journal).toEqual(data.journal);expect(restored.routines).toEqual(data.routines);expect(restored.focus).toEqual(data.focus);expect(restored.timer.endAt).toBeNull();
  });
  it('rejects invalid dates, duplicate ids, unsupported versions, and malformed collections',()=>{
    const data=freshData();const task={id:'one',title:'test',date:'2026-02-30',category:'Study',done:false,priority:false};
    expect(()=>parseBackup(JSON.stringify({...data,tasks:[task]}))).toThrow();
    expect(()=>parseBackup(JSON.stringify({...data,tasks:[{...task,date:'2026-11-13'},{...task,date:'2026-11-13'}]}))).toThrow();
    expect(()=>parseBackup(JSON.stringify({...data,version:2}))).toThrow();
    expect(()=>parseBackup(JSON.stringify({...data,focus:{'2026-11-13':-25}}))).toThrow();
    expect(()=>parseBackup(JSON.stringify({...data,journal:{'__invalid':{}}}))).toThrow();
  });
  it('loads corrupt browser storage without crashing or deleting the stored backup',()=>{
    localStorage.setItem(STORAGE_KEY,'broken json');expect(loadData().warning).toBeTruthy();expect(localStorage.getItem(STORAGE_KEY)).toBe('broken json');
  });
});
describe('time and calendar',()=>{
  it('uses local calendar dates across month/year boundaries and Monday weeks',()=>{
    expect(shiftDate('2026-12-31',1)).toBe('2027-01-01');expect(shiftDate('2028-03-01',-1)).toBe('2028-02-29');expect(weekDates('2026-11-15')).toEqual(['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15']);expect(dateKey(new Date(2026,0,1,0,1))).toBe('2026-01-01');
  });
  it('uses the wall clock after a background pause and credits a focus session once',()=>{
    const data=freshData();data.timer={...makeTimer(),endAt:100000,creditedDate:'2026-11-13'};expect(secondsLeft(data.timer,90001)).toBe(10);const done=finishTimer(data,105000);expect(done.focus['2026-11-13']).toBe(25);expect(done.timer.endAt).toBeNull();expect(finishTimer(done,200000).focus['2026-11-13']).toBe(25);
  });
  it('does not count a break as focus and recovers an expired session on reload',()=>{
    const data=freshData();data.timer={...makeTimer(5,'break'),endAt:1,creditedDate:'2026-11-13'};expect(finishTimer(data,2).focus).toEqual({});data.timer={...makeTimer(45),endAt:1,creditedDate:'2026-11-13'};localStorage.setItem(STORAGE_KEY,JSON.stringify(data));expect(loadData().data.focus['2026-11-13']).toBe(45);
  });
});
