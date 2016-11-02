<#include "../template/header.ftl">
<h2>Viewing Billet</h2>

<table>
<tr>
	<td>Name</td>
	<td>${name}</td>
</tr>
<tr>
	<td>Advisor Org</td>
	<td><#if advisorOrganization??> ${advisorOrganization.name} </#if></td>
</tr>
<tr>
	<td colspan=2>
		<#if context.advisor??>
			Currently filled by: ${context.advisor}
		<#else>
			No person currently in this billet<br>
			<i style="font-size:12px" >(go to a person page to set the billet on a person.. )</i>
		</#if>
	</td>
</tr>
</table>

<a href="/billets/${id}/edit">[Edit this billet]</a>
<#include "../template/footer.ftl">