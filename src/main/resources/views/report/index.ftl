<#include "../template/header.ftl">

<section class="anet-block">
  <div class="anet-block__title">
    Report Date - Advisor Name with Principal Name
    <div class="pull-right">
    	Approval Status
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Label</div>
       	<div class="content">Content</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        Report Content
        </div>
        <div class="field">
        <small>
        Created at: CreatedAt <br>Updated at: UpdatedAt
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
	      </div>
	      <div class="col-md-6">
	      </div>
	  </div>
  </div>
  </div>
</section>

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
})
</script>