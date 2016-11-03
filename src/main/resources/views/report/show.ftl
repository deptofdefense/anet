<#include "../template/header.ftl">
<h1>showing a report</h1>
Report: ${id} - ${createdAt}<br>

<p>${reportText}<p>
<p><b>Next Steps: </b>${nextSteps}</p>

<table>
<tr>
	<td>Author</td>
	<td>${author.name}</td>
</tr>.
<tr>
	<td>exsum?</td>
	<td>${exsum!}</td>
</tr>
<tr>
	<td>state</td>
	<td>${state}</td>
</tr>
<tr>
	<td>Principals:</td>
	</td><#if principals??>
		<#list principals as principal>
		
		</#list>
	</#if></td>
</tr>
</table>
<#include "../template/footer.ftl">
