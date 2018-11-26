// Colour Scale Generator
// Takes two RGB values and outputs a colour scale to
// transform a source into a destination colour

function colourScaleGen() 
{
	var dialog = new Dialog;
    var dialog_elements = [];
    var drawing_elements = [];
	
	dialog.caption = "Colour Scale Generator"; // orig: Which Palette To Apply Across Cols
	dialog.okButtonText = "Generate";
	dialog.cancelButtonText = "Cancel";
	
	dialog_elements['srcRVal'] = new LineEdit;
    dialog_elements['srcRVal'].label = "Source R Value"; 
    dialog.add( dialog_elements['srcRVal'] );
	
	dialog_elements['srcGVal'] = new LineEdit;
    dialog_elements['srcGVal'].label = "Source G Value"; 
    dialog.add( dialog_elements['srcGVal'] );
	
	dialog_elements['srcBVal'] = new LineEdit;
    dialog_elements['srcBVal'].label = "Source B Value"; 
    dialog.add( dialog_elements['srcBVal'] );
	

	dialog_elements['destRVal'] = new LineEdit;
    dialog_elements['destRVal'].label = "Destination R Value"; 
    dialog.add( dialog_elements['destRVal'] );
	
	dialog_elements['destGVal'] = new LineEdit;
    dialog_elements['destGVal'].label = "Destination G Value"; 
    dialog.add( dialog_elements['destGVal'] );
	
	dialog_elements['destBVal'] = new LineEdit;
    dialog_elements['destBVal'].label = "Destination B Value"; 
    dialog.add( dialog_elements['destBVal'] );
	
	if ( dialog.exec() ) 
	{
		var srcRGB = [ dialog_elements['srcRVal'].text, dialog_elements['srcGVal'].text, dialog_elements['srcBVal'].text ];
		var destRGB = [ dialog_elements['destRVal'].text, dialog_elements['destGVal'].text, dialog_elements['destBVal'].text ];
		
		colourDiff(srcRGB , destRGB);
	}
}

function clamp(val, botRange, topRange) 
{
	if (val < botRange) 
	{
		val = botRange;
	}
	else if (val > topRange)
	{
		val = topRange;
	}
	
	return val;
}

function colourDiff(srcColour, destColour) 
{
	var finVal = [];
	var colourList = ["RED","GREEN","BLUE"];
	
	var selNode = selection.selectedNode(0);
	var selectedNodeParent = node.parentNode( selNode );
	var selectedNodeX = node.coordX( selNode );
	var selectedNodeY = node.coordY( selNode );
	
	
	if (selectedNodeParent == "")
	{
		selectedNodeParent = "Top";
	}
	
	for (var x = 0; x < srcColour.length; x++)
	{
		srcColour[x] = clamp(srcColour[x], 0, 255);
		destColour[x] = clamp(destColour[x], 0, 255);
		
		finVal.push( destColour[x] / srcColour[x] );
	}
	
	MessageLog.trace(finVal);
	
	scene.beginUndoRedoAccum("AG_duplicateNodes");
	var newColourScale = node.add( selectedNodeParent, "Colour-Scale", "COLOR_SCALE", selectedNodeX + 100, selectedNodeY, 0);
	
	for (var x = 0; x < colourList.length; x++)
	{
		node.setTextAttr( newColourScale, colourList[x], 0, finVal[x] );
	}
	
	scene.endUndoRedoAccum();
	return;
}