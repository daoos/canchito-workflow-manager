var NORMAL_STROKE = 1;
var SEQUENCEFLOW_STROKE = 1.5;
var TASK_STROKE = 1;
var CALL_ACTIVITY_STROKE = 2;
var ENDEVENT_STROKE = 3;
var CURRENT_ACTIVITY_STROKE = 2;
       	
var COMPLETED_COLOR= "#2674aa";
var TEXT_COLOR= "#373e48";
var CURRENT_COLOR= "#66AA66";
var HOVER_COLOR= "#666666";
var ACTIVITY_STROKE_COLOR = "#bbbbbb";
var ACTIVITY_FILL_COLOR = "#f9f9f9";
var MAIN_STROKE_COLOR = "#585858";

var TEXT_PADDING = 3;
var ARROW_WIDTH = 4;
var MARKER_WIDTH = 12;

var TASK_FONT = {font: "11px Arial", opacity: 1, fill: Raphael.rgb(0, 0, 0)};

// icons
var ICON_SIZE = 16;
var ICON_PADDING = 4;

var INITIAL_CANVAS_WIDTH;
var INITIAL_CANVAS_HEIGHT;

var paper;
var viewBox;
var viewBoxWidth;
var viewBoxHeight;

var canvasWidth;
var canvasHeight;

var definitionId = $('#bpmnModel').attr('data-definition-id');
var instanceId = $('#bpmnModel').attr('data-instance-id');
var historyInstanceId = $('#bpmnModel').attr('data-history-id');
var serverId = $('#bpmnModel').attr('data-server-id');
 
    var elementsAdded = new Array();
    var elementsRemoved = new Array();
    var changeStateStartElementIds = new Array();
    var changeStateStartElements = new Array();
    var changeStateStartGlowElements = new Array();
    var changeStateEndElementIds = new Array();
    var changeStateEndElements = new Array();
    var changeStateEndGlowElements = new Array();
    
    var collapsedItemNavigation = new Array();
    var bpmnData;
	
	function _showTip(htmlNode, element)
  	{
		var documentation = "";
	if (element.name && element.name.length > 0)
	{
		documentation += "<b>Name</b>: <i>" + element.name + "</i><br/><br/>";
	}
	
	var text;
	if (element.name && element.name.length > 0)
	{
		text = element.name;
	}
	else
	{
		text = element.id;
	}
	
	htmlNode.qtip({ 
    	content: {
      		text: documentation,
      		title: {
    	  		text: text
      		}
    	},
        position: {
          my: 'top left',
          at: 'bottom center',
          viewport: $(window)
        },
        hide: {
          fixed: true, delay: 100,
          event: 'click mouseleave'
        },
        style: {
        	classes: 'ui-tooltip-kisbpm-bpmn'
        }
  });
}

function _expandCollapsedElement(element) {
    if (bpmnData.collapsed) {
        for (var i = 0; i < bpmnData.collapsed.length; i++) {
            var collapsedItem = bpmnData.collapsed[i];
            if (element.id == collapsedItem.id) {
                paper.clear();
                
                var modelElements = collapsedItem.elements;
                for (var i = 0; i < modelElements.length; i++) {
                    var subElement = modelElements[i];
                    var drawFunction = eval("_draw" + subElement.type);
                    drawFunction(subElement);
                }
                
                if (collapsedItem.flows) {
                    for (var i = 0; i < collapsedItem.flows.length; i++) {
                        var subFlow = collapsedItem.flows[i];
                        _drawFlow(subFlow);
                    }
                }
                
                var collapsedName;
                if (element.name) {
                    collapsedName = element.name;
                } else {
                    collapsedName = 'sub process ' + element.id;
                }
                
                collapsedItemNavigation.push({
                    "id": element.id,
                    "name": collapsedName
                });
                
                _buildNavigationTree();
                
                break;
            }
        }
    }
}

function _navigateTo(elementId) {
    var modelElements = undefined;
    var modelFlows = undefined;
    newCollapsedItemNavigation = new Array();
    
    if (elementId == 'FLOWABLE_ROOT_PROCESS') {
        modelElements = bpmnData.elements;
        modelFlows = bpmnData.flows;
        
    } else {
    
        for (var i = 0; i < bpmnData.collapsed.length; i++) {
            var collapsedItem = bpmnData.collapsed[i];
            
            var collapsedName = undefined;
            for (var j = 0; j < collapsedItemNavigation.length; j++) {
                if (elementId == collapsedItemNavigation[j].id) {
                    collapsedName = collapsedItemNavigation[j].name;
                    break;
                }
            }
        
            if (!collapsedName) {
                continue;
            }
            
            newCollapsedItemNavigation.push({
                "id": collapsedItem.id,
                "name": collapsedName
            });
            
            if (elementId == collapsedItem.id) {
                modelElements = collapsedItem.elements;
                modelFlows = collapsedItem.flows;
                break;
            }
        }
    }
    
    if (modelElements) {
        paper.clear();
                    
        for (var i = 0; i < modelElements.length; i++) {
            var subElement = modelElements[i];
            var drawFunction = eval("_draw" + subElement.type);
            drawFunction(subElement);
        }
        
        if (modelFlows) {
            for (var i = 0; i < modelFlows.length; i++) {
                var subFlow = modelFlows[i];
                _drawFlow(subFlow);
            }
        }
        
        collapsedItemNavigation = newCollapsedItemNavigation;
        
        _buildNavigationTree();
    }
}

function _buildNavigationTree() {
    var navigationUrl = '| <a href="javascript:_navigateTo(\'FLOWABLE_ROOT_PROCESS\')">Root</a>';
                
    for (var i = 0; i < collapsedItemNavigation.length; i++) {
        navigationUrl += ' > <a href="javascript:_navigateTo(\'' + collapsedItemNavigation[i].id + '\')">' + 
            collapsedItemNavigation[i].name + '</a>';
    }
    
    $('#navigationTree').html(navigationUrl);
}

function _addHoverLogic(element, type, defaultColor)
{
    var strokeColor = _bpmnGetColor(element, defaultColor);
	var topBodyRect;
	if (type === "rect") {
		topBodyRect = paper.rect(element.x, element.y, element.width, element.height);
		
	} else if (type === "circle") {
		var x = element.x + (element.width / 2);
		var y = element.y + (element.height / 2);
		topBodyRect = paper.circle(x, y, 15);
		
	} else if (type === "rhombus") {
		topBodyRect = paper.path("M" + element.x + " " + (element.y + (element.height / 2)) + 
			"L" + (element.x + (element.width / 2)) + " " + (element.y + element.height) + 
			"L" + (element.x + element.width) + " " + (element.y + (element.height / 2)) +
			"L" + (element.x + (element.width / 2)) + " " + element.y + "z"
		);
	}
	
	var opacity = 0;
	var fillColor = "#ffffff";
	if ($.inArray(element.id, elementsAdded) >= 0) {
		opacity = 0.2;
		fillColor = "green";
	}
	
	if ($.inArray(element.id, elementsRemoved) >= 0) {
		opacity = 0.2;
		fillColor = "red";
	}
	
	topBodyRect.attr({
		"opacity": opacity,
        "stroke" : "none",
        "fill" : fillColor
  	});
	_showTip($(topBodyRect.node), element);
	
	topBodyRect.mouseover(function() {
		paper.getById(element.id).attr({"stroke": HOVER_COLOR});
	});
	
	topBodyRect.mouseout(function() {
		paper.getById(element.id).attr({"stroke": strokeColor});
	});
	
	topBodyRect.click(function() {
	    var startElementIndex = $.inArray(element.id, changeStateStartElementIds);
	    var endElementIndex = $.inArray(element.id, changeStateEndElementIds);
	    if (startElementIndex >= 0) {
	        
	        var glowElement = changeStateStartGlowElements[startElementIndex];
			glowElement.remove();
			
			changeStateStartGlowElements.splice(startElementIndex, 1);
			changeStateStartElementIds.splice(startElementIndex, 1);
            changeStateStartElements.splice(startElementIndex, 1);
			
		} else if (endElementIndex >= 0) {
		
		    var glowElement = changeStateEndGlowElements[endElementIndex];
            glowElement.remove();
            
            changeStateEndGlowElements.splice(endElementIndex, 1);
            changeStateEndElementIds.splice(endElementIndex, 1);
            changeStateEndElements.splice(endElementIndex, 1);
			
		} else {
		    if (element.current) {
		       var startGlowElement = topBodyRect.glow({'color': 'blue'});
		       changeStateStartGlowElements.push(startGlowElement);
		       changeStateStartElementIds.push(element.id);
		       changeStateStartElements.push(element);
               
		    } else {
		       var endGlowElement = topBodyRect.glow({'color': 'red'});
		       changeStateEndGlowElements.push(endGlowElement);
               changeStateEndElementIds.push(element.id);
               changeStateEndElements.push(element);
		    }
		}
		
		if (changeStateStartElements.length > 0 && changeStateEndElements.length > 0) {
		   $('#changeStateButton').show();
		} else {
		   $('#changeStateButton').hide();
		}
	});
}

function _zoom(zoomIn)
{
	var tmpCanvasWidth, tmpCanvasHeight;
    if (zoomIn) 
    {
    	tmpCanvasWidth = canvasWidth * (1.0/0.90);
    	tmpCanvasHeight = canvasHeight * (1.0/0.90);
    }
    else 
    {
    	tmpCanvasWidth = canvasWidth * (1.0/1.10);
    	tmpCanvasHeight = canvasHeight * (1.0/1.10);
    }
    
    if (tmpCanvasWidth != canvasWidth || tmpCanvasHeight != canvasHeight)
    {
    	canvasWidth = tmpCanvasWidth;
    	canvasHeight = tmpCanvasHeight;
    	paper.setSize(canvasWidth, canvasHeight);
    }
}

function _showProcessDiagram(data) {
	var ajaxUrl = url;
	var ajaxData;
	
	if(data.historyInstanceId != null) {
		ajaxUrl += 'diagramviewer/getdiagramhighlightsbyhistoricprocessinstanceid';
		ajaxData = { 'processInstanceId' :  data.historyInstanceId };
	} else if(data.processInstanceId != null) {
		ajaxUrl += 'diagramviewer/getdiagramhighlightsbyprocessinstanceid';
		ajaxData = { 'processInstanceId' :  data.processInstanceId };
	} else {
		ajaxUrl += 'diagramviewer/getdiagramlayoutbyprocessdefinitionid';
		ajaxData = { 'processDefinitionId' :  data.processDefinitionId };
	}
	
	Ajax.executeAjax(ajaxUrl, ajaxData, {
		success: function(data, textStatus, jqXHR) {
			var data = data.body;
			
			if (!data.elements || data.elements.length == 0) return;
			
			INITIAL_CANVAS_WIDTH = data.diagramWidth + 20;
			INITIAL_CANVAS_HEIGHT = data.diagramHeight + 50;
			canvasWidth = INITIAL_CANVAS_WIDTH;
			canvasHeight = INITIAL_CANVAS_HEIGHT;
			viewBoxWidth = INITIAL_CANVAS_WIDTH;
			viewBoxHeight = INITIAL_CANVAS_HEIGHT;
			
			var x = 0;
			if ($(window).width() > canvasWidth)
			{
				x = ($(window).width() - canvasWidth) / 2 - (data.diagramBeginX / 2);
			}
			
			$('#bpmnModel').width(INITIAL_CANVAS_WIDTH);
			$('#bpmnModel').height(INITIAL_CANVAS_HEIGHT);
			paper = Raphael(document.getElementById('bpmnModel'), canvasWidth, canvasHeight);
			paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight, false);
	  		paper.renderfix();
	  		
	  		if (data.pools)
	  		{
	  			for (var i = 0; i < data.pools.length; i++)
			    {
			    	var pool = data.pools[i];
			    	_drawPool(pool);
			    }
	  		}
	  		
		    var modelElements = data.elements;
		    for (var i = 0; i < modelElements.length; i++)
		    {
		    	var element = modelElements[i];
		    	try {
		    		//console.log(element.type);
		    		var drawFunction = eval("_draw" + element.type);
		    		drawFunction(element);
		    	} catch (err) {
					console.warn(err);
				}
		    }
		    
		    if (data.flows)
		    {
			    for (var i = 0; i < data.flows.length; i++)
			    {
			    	var flow = data.flows[i];
			    	_drawFlow(flow);
			    }
		    }
		    
		    bpmnData = data;
		},
		error: function(jqXHR, textStatus, errorThrown) {
		    alert("error");
		},
		fail: function(jqXHR, textStatus, errorThrown) {
		    alert("error");
		}
	});
	
//	var request;
//	if (historyInstanceId != null) {
//	   request = $.ajax({
//            type: 'POST',
//            data: ajaxData,
//            url: ajaxUrl
//        });
//        
//	} else if (instanceId != null) {
//		request = $.ajax({
//		    type: 'POST',
//            data: ajaxData,
//		    url: ajaxUrl
//		});
//		
//	} else {
//		request = $.ajax({
//		    type: 'POST',
//            data: ajaxData,
//		    url: ajaxUrl
//		});
//	}
//
//	request.success(function(data, textStatus, jqXHR) {
//		
//		if (!data.elements || data.elements.length == 0) return;
//		
//		INITIAL_CANVAS_WIDTH = data.diagramWidth + 20;
//		INITIAL_CANVAS_HEIGHT = data.diagramHeight + 50;
//		canvasWidth = INITIAL_CANVAS_WIDTH;
//		canvasHeight = INITIAL_CANVAS_HEIGHT;
//		viewBoxWidth = INITIAL_CANVAS_WIDTH;
//		viewBoxHeight = INITIAL_CANVAS_HEIGHT;
//		
//		var x = 0;
//		if ($(window).width() > canvasWidth)
//		{
//			x = ($(window).width() - canvasWidth) / 2 - (data.diagramBeginX / 2);
//		}
//		
//		$('#bpmnModel').width(INITIAL_CANVAS_WIDTH);
//		$('#bpmnModel').height(INITIAL_CANVAS_HEIGHT);
//		paper = Raphael(document.getElementById('bpmnModel'), canvasWidth, canvasHeight);
//		paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight, false);
//  		paper.renderfix();
//  		
//  		if (data.pools)
//  		{
//  			for (var i = 0; i < data.pools.length; i++)
//		    {
//		    	var pool = data.pools[i];
//		    	_drawPool(pool);
//		    }
//  		}
//  		
//	    var modelElements = data.elements;
//	    for (var i = 0; i < modelElements.length; i++)
//	    {
//	    	var element = modelElements[i];
//	    	try {
//	    		//console.log(element.type);
//	    		var drawFunction = eval("_draw" + element.type);
//	    		drawFunction(element);
//	    	} catch (err) {
//				console.warn(err);
//			}
//	    }
//	    
//	    if (data.flows)
//	    {
//		    for (var i = 0; i < data.flows.length; i++)
//		    {
//		    	var flow = data.flows[i];
//		    	_drawFlow(flow);
//		    }
//	    }
//	    
//	    bpmnData = data;
//	});
//
//	request.error(function(jqXHR, textStatus, errorThrown) {
//	    alert("error");
//	});
}

$(document).ready(function () {
 
     $(document).on('click', '#changeStateButton', function(e) {
        e.preventDefault();
        
        var startElementText = '';
        for (var i = 0; i < changeStateStartElements.length; i++) {
            if (startElementText.length > 0) {
                startElementText += ', ';
            }
            startElementText += changeStateStartElements[i].name
        }
        
        var endElementText = '';
        for (var i = 0; i < changeStateEndElements.length; i++) {
            if (endElementText.length > 0) {
                endElementText += ', ';
            }
            endElementText += changeStateEndElements[i].name
        }
        
        $.confirm({
            title: 'Change current activity?',
            content: 'Are you sure you want to move the current state from (' + 
                startElementText + ') to (' + endElementText + ')',
            buttons: {
                confirm: function () {
                    $.ajax({
                        type: 'post',
                        url: './app/rest/admin/process-instances/' + instanceId + '/change-state',
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify({
                            cancelActivityIds: changeStateStartElementIds,
                            startActivityIds: changeStateEndElementIds
                        }),
                        success: function() {
                            paper.clear();
                            _showProcessDiagram();
                        }
                    });
                },
                cancel: function () {
                    
                }
            }
        });
     });
     
});