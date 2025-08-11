export const parseDateTime = (date: Date | string, time: string): Date | null => {
    if (!date || !time) {
      console.error("Invalid date or time input:", { date, time });
      return null;
    }
  
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date); // Convert string to Date object if necessary
    } else {
      dateObj = date;
    }
  
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid Date object:", { date });
      return null;
    }
  
    // Extract date parts (year, month, day) and combine with time
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time format:", { time });
      return null;
    }
  
    const combinedDate = new Date(dateObj);
    combinedDate.setHours(hours, minutes, 0, 0); // Set time components
  
    if (isNaN(combinedDate.getTime())) {
      console.error("Failed to combine date and time:", { date, time });
      return null;
    }
  
    return combinedDate;
  };
