<#include "../template/header.ftl">
<h1>Listing Billets</h1>

<table>
<tr><th>id</th><th>name</th><th>Advisor Organization</th></tr>
<#list billets as billet>
	<tr>
		<td>${billet.id}</td>
		<td>${billet.name}</td>
		<td>
			<#if billet.advisorOrganization?? >
				<a href="/advisorOrganizations/${billet.advisorOrganization.id}">${billet.advisorOrganization.name}</a>
			</#if>
		</td>
		<td><a href="/billets/${billet.id}">[Edit]</a></td>
	</tr>
</#list>
</table>

<#include "../template/footer.ftl">