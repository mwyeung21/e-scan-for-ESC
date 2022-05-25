var url = "https://docs.google.com/spreadsheets/d/1-1f6APqFWyQFC-iCe7lXbErUb97iMTSF68J5JSNHiNU/edit#gid=0";
var myscript = "https://script.google.com/macros/s/AKfycbx-lOd4CrV_ytpZaAiNMj2LW2rhbBakUUVYycwgPW_GH7gO32M/exec";
var positionOfNetid = 0;


function doGet(e) {
  
  //this doesnt work...idk why this doesnt give the location parameter
  if (e.parameters.loc != undefined ) {
    return HtmlService.createTemplateFromFile("esc-check-in").evaluate();
  }
  else {
    return HtmlService.createTemplateFromFile("login-page").evaluate();
  }
  
  //return HtmlService.createTemplateFromFile("login-page").evaluate(); //webpage; run all the other files to create this
}

function checkStudentInDatabase(netID) {
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  var data = ws.getRange(1, 1, ws.getLastRow(), 4).getValues();//start from (1,1) and get all the rows and the first 4 columns 
  var netidlist = data.map(function(r){return r[3];}); //store the netid into an array
  var positionOfNetid = netidlist.indexOf(netID)+1; //identify the position of netid in the array
  var sendID = positionOfNetid; 
  
  if (positionOfNetid != 0){
    var existingStudent = {};
    existingStudent.name = ws.getRange(sendID,5).getDisplayValue();
    existingStudent.major = ws.getRange(sendID,6).getDisplayValue();
    existingStudent.stuGradYear = ws.getRange(sendID,3).getDisplayValue();
    existingStudent.netIDusername = ws.getRange(sendID,4).getDisplayValue();
    existingStudent.stuQR = ws.getRange(sendID,8).getDisplayValue();
    existingStudent.dept = ws.getRange(sendID,18).getDisplayValue();
    positionOfNetid = 0;
    return existingStudent;
  }
  positionOfNetid = 0;
  return sendID;

}

function userClicked(studentInfo){
  
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  var lastrow = ws.getLastRow()+1;
  studentInfo.row = lastrow;
  var lastcol = ws.getLastColumn() +1;
  var netid ="=ARRAYFORMULA(IFERROR((IMPORTXML(\"https://directory.uci.edu/people/\"&SUBSTITUTE($B" + lastrow.toString() + ":$B, \"uci.edu\", \"\")&\"\", \"//span[contains(., \'\"&D$1&\"\')]/parent::p/following-sibling::div[1]\")), \"\"))";
  //add department
  var dept ="=IMPORTXML(\"https://directory.uci.edu/people/\"&SUBSTITUTE($B" + lastrow.toString() + ":$B, \"uci.edu\", \"\")&\"\",\"//table/tr[2]/td[2]\")";
  var name ="=ARRAYFORMULA(IFERROR((IMPORTXML(\"https://directory.uci.edu/people/\"&SUBSTITUTE($B" + lastrow.toString() + ":$B, \"uci.edu\", \"\")&\"\", \"//span[contains(., \'\"&E$1&\"\')]/parent::p/following-sibling::div[1]\")), \"\"))";
  //studentInfo.name = ws.getRange('E'+ lastrow.toString()).getDisplayValue();
  var major ="=ARRAYFORMULA(IFERROR((IMPORTXML(\"https://directory.uci.edu/people/\"&SUBSTITUTE($B" + lastrow.toString() + ":$B, \"uci.edu\", \"\")&\"\", \"//span[contains(., \'\"&F$1&\"\')]/parent::p/following-sibling::div[1]\")), \"\"))";
  var gradeLevel ="=ARRAYFORMULA(IFERROR((IMPORTXML(\"https://directory.uci.edu/people/\"&SUBSTITUTE($B" + lastrow.toString() + ":$B, \"uci.edu\", \"\")&\"\", \"//span[contains(., \'\"&G$1&\"\')]/parent::p/following-sibling::div[1]\")), \"\"))";
  //var str = studentInfo.studentEmail;
  //var indexofAtSign = str.search("@");
  //var stringCutNetid = str.slice(0,indexofAtSign);
  //studentInfo.stuQR = "https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=" + myscript + "?loc=" + lastrow + "&user=" + stringCutNetid;
  studentInfo.stuQR = "https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=" + myscript + "?loc=" + lastrow
  studentInfo.swag1 = "False";
  studentInfo.swag2 = "False";

  ws.appendRow([new Date(),studentInfo.studentEmail, studentInfo.stuGradYear,netid,name, major, gradeLevel,studentInfo.stuQR, studentInfo.swag1, studentInfo.swag2, '','','','','','','',dept]);
  studentInfo.dept = ws.getRange(lastrow,18).getDisplayValue();
  studentInfo.netid = ws.getRange(lastrow,4).getDisplayValue();
  studentInfo.name = ws.getRange(lastrow,5).getDisplayValue(); //4,5 give me "Wenyan1 Lei" (row,col)
  studentInfo.major = ws.getRange(lastrow,6).getDisplayValue();
  studentInfo.gradeLevel = ws.getRange(lastrow,7).getDisplayValue();
  
  //var columngroup = ws.getColumnGroup(1,1);
  
  //var userrow = ws.getRange('E6').getDisplayValue(); //give me what is in C2-> "2020"
  //var allUsers = ws.getRange(1,1,ws.getLastRow(),ws.getLastColumn()).getValues();
  //var userList = allUsers.map(function(r){return r[1];}) //r[1]  is column 2 in google sheet
  //var userrow = userList.indexOf("mwyeung@uci.edu");
  //return userrow; //this returns the index of the first row where it sees this email in the excel sheet. 
  
  addTimeStamp(studentInfo); //add timestamp
  
  //check if people are engr majors FILTER WORKSS!!!
  var engrMajors = ['Engr AE','EngrBMP','EngrChm','Engr CE','EngrCpE','CSE','Engr EE','EngrEnv','Enr MSE','Engr ME', 'EngrMAE', 'EngrMSE','Engineering','Engr BM'];
  //check depts
  if (studentInfo.dept.indexOf("Engineering") != -1){
    return studentInfo;
  }
 
  
  //check engr majors
  if (studentInfo.override != "TRUE")  {
    if (engrMajors.indexOf(studentInfo.major) != -1){
          return studentInfo;
        }
      //for (var i=0; i<=engrMajors.length; i++) {
        
      //  if (engrMajors[i] == studentInfo.major){
      //    return studentInfo;
      //  }
      //}
      ws.deleteRow(lastrow);
      return "failed";
  }
  
  return studentInfo;

 
}


function updateSwag1(studentInfo){
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  ws.getRange(studentInfo.row,9).setValue('TRUE'); // swag 1 is on column 9 and swag 2 is on column 10
}

function updateSwag2(studentInfo){
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  ws.getRange(studentInfo.row,10).setValue('TRUE'); 
}
  
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getStudentInfo(studentInfo){
  //for new students
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  //studentInfo.netid = ws.getRange(studentInfo.row,4).getDisplayValue(); //no box yet
  studentInfo.name = ws.getRange(studentInfo.row,5).getDisplayValue();
  studentInfo.major = ws.getRange(studentInfo.row,6).getDisplayValue();
  //added dept 
  if (studentInfo.major == "") {
    studentInfo.major = ws.getRange(studentInfo.row,18).getDisplayValue();
  }
  studentInfo.gradeLevel = ws.getRange(studentInfo.row,7).getDisplayValue(); //no box yet
  studentInfo.stuGradYear = ws.getRange(studentInfo.row,3).getDisplayValue();
  studentInfo.studentEmail =ws.getRange(studentInfo.row,2).getDisplayValue();
  studentInfo.stuQR = ws.getRange(studentInfo.row,8).getDisplayValue();
  studentInfo.swag1 = ws.getRange(studentInfo.row,9).getDisplayValue();
  studentInfo.swag2 = ws.getRange(studentInfo.row,10).getDisplayValue();
  studentInfo.monday = ws.getRange(studentInfo.row,11).getDisplayValue();
  studentInfo.tuesday = ws.getRange(studentInfo.row,12).getDisplayValue();
  studentInfo.wednesday = ws.getRange(studentInfo.row,13).getDisplayValue();
  studentInfo.thursday = ws.getRange(studentInfo.row,14).getDisplayValue();
  studentInfo.friday = ws.getRange(studentInfo.row,15).getDisplayValue();
  studentInfo.saturday = ws.getRange(studentInfo.row,16).getDisplayValue();
  studentInfo.sunday = ws.getRange(studentInfo.row,17).getDisplayValue();
  //add days later
 
  return studentInfo;
}


function addTimeStamp(studentInfo){
  //TIMESTAMP STUFF
  var sprsheet = SpreadsheetApp.openByUrl(url);
  var ws = sprsheet.getSheetByName("Sign in");
  var currentDate = Utilities.formatDate(new Date(), "PST", "EEEE");
  studentInfo.checkDate = currentDate;
  studentInfo.currentLoginDate = Utilities.formatDate(new Date(), "PST", "MM/dd/yyyy hh:mm a");
  if (currentDate == "Saturday"){
    ws.getRange(studentInfo.row,16).setValue(studentInfo.currentLoginDate); 
  }
  else if (currentDate == "Sunday") {
    ws.getRange(studentInfo.row,17).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Monday") {
    ws.getRange(studentInfo.row,11).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Tuesday") {
    ws.getRange(studentInfo.row,12).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Wednesday") {
    ws.getRange(studentInfo.row,13).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Thursday") {
    ws.getRange(studentInfo.row,14).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Friday") {
    ws.getRange(studentInfo.row,15).setValue(studentInfo.currentLoginDate);
  }
  else if (currentDate == "Sunday") {
    ws.getRange(studentInfo.row,17).setValue(studentInfo.currentLoginDate);
  }
}
