
function dtg { 
	a=`date +%Y-%m-%d\ %H:%M:%S.`
	b=`date +%N | cut -c1,2,3`
	c=`date +\ %z`
	echo "${a}${b}${c}"
}

while read input 
do
	time=`dtg`;
	echo ${input} | sed "s/CURRENT_TIMESTAMP/'${time}'/g" | sed -r "s/'([0-9]{4}-[0-9]{2}-[0-9]{2})'/'\1 00:00:00.000 -0000'/g" | sed "s/TRUNCATE TABLE/DELETE FROM/"
done
