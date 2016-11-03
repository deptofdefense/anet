<#include "../template/header.ftl">

<section class="anet-block">
  <div class="anet-block__title">
    ${firstName} ${lastName}
    <div class="pull-right">
    	${role}
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Email</div>
       	<div class="content"><a href="mailto:${emailAddress}">${emailAddress}</a></div>
	   </div>
	   <div class="field">
       	<div class="header">Phone</div>
       	<div class="content"><a href="tel:${phoneNumber}">${phoneNumber}</a></div>
	   </div>
	   <div class="field">
       	<div class="header">Rank</div>
       	<div class="content">${rank}</div>
	   </div>
	   <div class="field">
       	<div class="header">Status</div>
       	<div class="content">${status}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${biography}
        </div>
        <div class="field">
        <small>
        Created at: ${createdAt} <br>Updated at: ${updatedAt}
        </small>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="anet-block">
  <div class="anet-block__title">
    Billet Settings
  </div>
   <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
      <div class="field">

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

      </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
   	  </div>
   	</div>
   </div>
 </div>
</section>


<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() { 
	$("#billetSelect").select2( {
	    dropdownParent: $(".mainbody"), 
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