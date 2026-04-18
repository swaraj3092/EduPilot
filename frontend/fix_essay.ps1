$p = 'c:\Users\KIIT0001\Desktop\tenzor hack\frontend\src\app\components\EssayCoach.tsx'
$c = Get-Content $p
$c[0..750] + $c[752..($c.Length-1)] | Set-Content $p -Encoding utf8
