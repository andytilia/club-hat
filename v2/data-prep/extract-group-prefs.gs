function prepareGroupPreferences() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName('Form Responses 1'); // Adjust if your form responses sheet has a different name
  const allStudentsSheet = ss.getSheetByName('all students');
  const outputSheet =
    ss.getSheetByName('Group Preferences') ||
    ss.insertSheet('Group Preferences');

  // Clear the output sheet
  outputSheet.clear();

  // Get all data
  const formData = formSheet.getDataRange().getValues();
  const allStudentsData = allStudentsSheet.getDataRange().getValues();

  // Create maps for email to student ID and student name
  const emailToIdMap = new Map();
  const idToNameMap = new Map();
  allStudentsData.forEach((row) => {
    const email = row[0].toLowerCase();
    const id = row[0].slice(2, 8);
    const name = row[1];
    emailToIdMap.set(email, id);
    idToNameMap.set(id, name);
  });

  // Extract club names from headers
  const headers = formData[0];
  const clubColumns = headers
    .slice(3) // Start from the 4th column (index 3)
    .map((header, index) => {
      return header
        ? { index: index + 3, name: String(header).trim() }
        : null;
    })
    .filter((item) => item !== null);

  console.log(clubColumns);

  // Process form data
  const processedData = formData
    .slice(1)
    .map((row) => {
      const email = row[1].toLowerCase();
      const studentId = emailToIdMap.get(email);

      if (!studentId) {
        console.log(
          `No matching student ID found for email: ${email}`
        );
        return null;
      }

      const studentName = idToNameMap.get(studentId);

      const preferences = clubColumns
        .map((club) => ({ club: club.name, choice: row[club.index] }))
        .filter(
          (pref) =>
            pref.choice &&
            (pref.choice.includes('1st') ||
              pref.choice.includes('2nd') ||
              pref.choice.includes('3rd') ||
              pref.choice.includes('4th'))
        )
        .sort((a, b) => {
          const order = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };
          return (
            order[a.choice.split(' ')[0]] -
            order[b.choice.split(' ')[0]]
          );
        })
        .map((pref) => pref.club)
        .slice(0, 4);

      // Pad the preferences array to always have 4 elements
      while (preferences.length < 4) {
        preferences.push('');
      }

      return [email, ...preferences];
    })
    .filter((row) => row !== null);

  // Sort the processed data by student ID
  processedData.sort((a, b) => a[0].localeCompare(b[0]));

  // Write to output sheet
  outputSheet
    .getRange(1, 1, processedData.length, 5)
    .setValues(processedData);

  // Auto-resize columns
  outputSheet.autoResizeColumns(1, 6);

  console.log('Group preferences processing completed.');
}
