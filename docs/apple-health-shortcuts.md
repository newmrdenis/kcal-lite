# Apple Health weight history

The app stores one weight per local calendar day, in kg, rounded to 0.1 kg.
History import merges weights only. It preserves meals, activity, settings and
weights on other dates. For matching dates, the imported value replaces the old
value. Reimporting the same file does not create duplicates.

## Export all measurements on iPhone

Create a separate shortcut named Export Weight History:

1. Shortcuts > + > Rename > Export Weight History.
2. Add Find Health Samples. Type: Weight. Remove the date filter to include all
   dates. Sort by Start Date, Order: Oldest First. Turn Limit off.
3. Add Repeat with Each using Health Samples.
4. Inside Repeat, add Get Details of Health Sample: Start Date of Repeat Item.
5. Add Format Date. Date Format: Custom. Format String: yyyy-MM-dd. Use the
   local time zone and Gregorian calendar. Use lowercase yyyy, not YYYY.
6. Add Get Details of Health Sample: Value of Repeat Item. Ensure the value is
   in kg. If it is in pounds, convert it to kg before continuing.
7. Add Round Number to Tenths Place. The CSV needs a plain number with a decimal
   point and no unit suffix. If the number uses a decimal comma, use Replace
   Text to replace the comma with a period before the next step.
8. Add Text containing the Formatted Date variable, a literal comma, and the
   weight number variable. Example output: 2020-05-17,73.4. This must be the last
   action inside Repeat so that Repeat Results contains these lines.
9. After End Repeat, add Combine Text: Repeat Results with New Lines.
10. Add Set Name: weight-history.csv, then Save File. Save to Files.
11. Run the shortcut and allow Health read access when requested.
12. Open Kcal Lite in the browser or installed app where your diary is stored.
    Expand Import weight history from Apple Health below the weight entry form,
    choose the saved file, and check the inline result. The All range shows the
    complete history.

This is a file-based import, not automatic background synchronization. Run it
again to merge new measurements. Do not use the full application JSON restore
for this purpose: that has different replacement semantics.

## Latest weight using a separate daily shortcut

Find Health Samples: Weight, no date filter, Start Date / Latest First, Limit 1.
Read Value in kg and Start Date from that sample. Format its date as yyyy-MM-dd.
Open the actual app URL with these query parameters:

    ?weight=73.4&date=2026-10-17

Insert variables rather than these example values. Skip opening the URL when
there is no sample. Use the sample's date, not today's date: otherwise an older
measurement would be copied into today. Keep this separate from the active
calorie shortcut because date currently applies to all values in the URL.

## Energy

Active Energy is all active expenditure, including workouts and everyday
movement. Workout active calories exclude resting expenditure during the
workout. Total Calories includes both active and resting expenditure for the
same period. Do not add workout calories again if they are already included
in imported daily Active Energy.
