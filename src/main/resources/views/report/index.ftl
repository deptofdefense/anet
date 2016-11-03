<#include "../template/header.ftl">
<h1>Listing Reports</h1>
<a href="/reports/new">[Create New Report]</a>
<table>
<tr><th>id</th><th>summary</th></tr>
<#list list as report>
	<tr>
		<td><a href="/reports/${report.id}">${report.id}</a></td>
		<td>
		<#if report.exsum??>
			${report.exsum}
		<#else>
			${report.author.name} met with [PRINCIPAL NAME] at
			<#if report.location??>${report.location.name}<#else><i>location missing</i></#if>
			on ${report.createdAt} to discuss [POAM NAME]
		</#if>
		</td>
	</tr>
</#list>
</table>
<#include "../template/footer.ftl">

