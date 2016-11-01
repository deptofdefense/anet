<#include "../template/header.ftl">
<h1>Listing Billets</h1>

<table>
<tr><th>id</th><th>name</th><th>aoId</th></tr>
<#list billets as billet>
	<tr>
		<td>${billet.id}</td>
		<td>${billet.name}</td>
		<td>
			<#if billet.advisorOrganization?? >
				${billet.advisorOrganization.name}
			</#if>
		</td>
		<td><a href="/billets/${billet.id}">[Edit]</a></td>
	</tr>
</#list>
</table>

<#include "../template/footer.ftl">