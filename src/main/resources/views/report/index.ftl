<#include "../template/header.ftl">

<h1>Listing Reports</h1>
<a href="/reports/new">Create New Report</a>
<table>
<tr><th>id</th><th>summary</th></tr>
<#list reports as report>
	report
</#list>
</table>

<#include "../template/footer.ftl">
