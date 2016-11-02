<#include "../template/header.ftl">

Hello, ${firstName} ${lastName} (${emailAddress!})!<br>
<table>
<tr>
	<th>Name:</th><td>${firstName} ${lastName}</td>
</tr>
<tr>
	<th>Email:</th><td>${emailAddress!}</td>
</tr>
<tr>
	<th>Phone:</th><td>${phoneNumber!}</td>
</tr>
<tr>
	<th>Rank:</th><td>${rank}</td>
</tr>
<tr>
	<th>Status:</th><td>${status}</td>
</tr>
<tr>
	<th>Role:</th><td>${role}</td>
</tr>
<tr>
	<th>Bio:</th><td>${biography}</td>
</tr>
<tr><td colspan=2><i>Created at: ${createdAt} , Updated at: ${updatedAt}</td></tr>
</table>
<#if context.billet??>
Billet Info: 
<ul>
<li>Id: ${context.billet.id} </li>
<li>Name: <a href="/billets/${context.billet.id}">${context.billet.name}</a></li>
<li>AO: 
	<#if context.billet.advisorOrganization?? >
		${context.billet.advisorOrganization.name}
	<#else>
		<i>None</i>
	</#if>
</li>
</ul>
<#else>
Not currently in a Billet.<br>
</#if>
Set Billet: <select id="billetSelect"></select><br>
<input type="button" id="billetSetBtn" value="Save"></input>
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() { 
	$("#billetSelect").select2( { 
		ajax: {
			url: "/billets/empty",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) { return {} },
			processResults : function(data, params) { 
				var results = _.map(data, function(el) { 
					return { 
						id: el["id"],
						text: el["name"]
					}
				});	
				return { results: results };
			}
		},
		minimumInputLength: 0,
		placeholder: "Begin typing to search for available billets"
	});
	
	$("#billetSetBtn").on('click', function(event) { 
		var billetId = $("#billetSelect").val();
		$.ajax({ url: '/billets/' + billetId + '/advisor',
			method: "POST",
			contentType: 'application/json',
			data: JSON.stringify({ id: ${id} })
		}).done(function (response) { 
			location.reload();
		})
	});
});
</script>