    
    var fso = CreateObject("Scripting.FileSystemObject");  
    var s = fso.CreateTextFile("articles/filename.txt", True);
    s.writeline("HI");
    s.writeline("Bye");
    s.writeline("-----------------------------");
    s.Close();