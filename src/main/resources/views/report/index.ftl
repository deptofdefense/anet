<#include "../template/header.ftl">
<#list list as report>
<section class="anet-block">
  <div class="anet-block__title">
    ${report.createdAt} - ${report.author.name} with Principal Name
    <div class="pull-right">
    	Approval Status
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Status:</div>
       	<div class="content">${report.state}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${report.reportText}
        </div>
        <div class="field">
        <small>
        Created at: ${report.createdAt} <br>Updated at: ${report.updatedAt}
        </small>
        </div>
      </div>
 	</div>
 	<div class="row">
 	<a class="expand" href="#">Expand</a>
 	</div>
    </div>
    <div class="expanded-area">
	  <div class="row">
	      <div class="col-md-6">
	      	<#if context.currentUser.id == report.author.id && report.state == "DRAFT">
	      		<button id="reportSubmitBtn" data-id="${report.id}" >Submit this report.</button> 
	      	</#if>
	      </div>
	      <div class="col-md-6">
	      </div>
	  </div>
  </div>
  </div>
</section>
</#list>
<#include "../template/footer.ftl">

<script type="text/javascript">
$(document).ready(function() { 
	$('.expand').on('click',function(e){
	var target = $(e.currentTarget).parents('.anet-block').find('.expanded-area')
	if(target.hasClass('show')) {
		target.removeClass('show')
	} else {
		target.addClass('show')
	}
	})
	
	$("#reportSubmitBtn").on("click", function(event) {
		var id = $(event.currentTarget).attr("data-id"); 
		$.ajax({
			url: "/reports/" + id + "/submit",
			method: "GET"
		}).done(function(response) { 
			location.reload();
		});
	});
})
</script>
