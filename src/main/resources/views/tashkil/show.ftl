<#include "../template/header.ftl">
<h2>Viewing Tashkil</h2>

<table>
<tr>
	<td>Name</td>
	<td>${name}</td>
</tr>
<tr>
	<td>Code:</td>
	<td>${code}</td>
</tr>
<tr>
	<td colspan=2>
		<#if principal??>
			Currently filled by: ${principal}
		<#else>
			No person currently in this Tashkil<br>
			<i style="font-size:12px" >(go to a person page to set the tashkil on a person.. )</i>
		</#if>
	</td>
</tr>
</table>

<a href="/tashkils/${id}/edit">[Edit this tashkil]</a>
<#include "../template/footer.ftl">