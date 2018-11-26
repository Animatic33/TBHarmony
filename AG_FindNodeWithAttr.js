// Check Node Network for Attribute Value
// By Andrew Glisinski. May 17 2018 - Nelvana

var pegsFound = [];

function FindNodeWithAttrUI() // USE THIS FUNCTION
{
	var dialog = new Dialog;
    var dialog_elements = [];
    var drawing_elements = [];
	
	dialog.caption = "Find Nodes with Attr Value"; // orig: Which Palette To Apply Across Cols
	dialog.okButtonText = "Find"
	dialog.cancelButtonText = "Cancel";
	
	dialog_elements['attrFind'] = new LineEdit;
    dialog_elements['attrFind'].label = "Attribute"; 
    dialog.add( dialog_elements['attrFind'] );
	
	dialog_elements['valFind'] = new LineEdit;
    dialog_elements['valFind'].label = "Value"; 
    dialog.add( dialog_elements['valFind'] );
	
	if ( dialog.exec() ) 
	{
		findNodesWithAttr(dialog_elements['attrFind'].text, dialog_elements['valFind'].text);
	}
}

function selectNodes(parentGrp) 
{
	var nNodes = node.numberOfSubNodes(parentGrp);
	
	for ( var i = 0; i < nNodes; i++)
	{
		var nodeName = node.subNode(parentGrp, i);
		var type = node.type(nodeName);

		if (type == "PEG") 
		{
			pegsFound.push(nodeName);
		}
		
		if (type == "GROUP") {
			selectNodes(nodeName);
		}
	
	}
	return;
}

function findNodesWithAttr(attr, val) 
{
	var foundAttrs = 0;
	selectNodes("Top");
	var operatorVal = "=";
	
	// allow operators to be used in the val
	if (val.indexOf(":") != -1)
	{
		var valSplit = val.split(":");
		operatorVal = valSplit[0];
		val = valSplit[1];
	}
	
	
	if (pegsFound.length == 0)
	{
		MessageBox.information("No Pegs Found.");
		return;
	}
	
	for (var x in pegsFound)
	{
		var nodeVal = parseFloat( node.getTextAttr( pegsFound[x], 0 , attr ) );
		
		switch (operatorVal)
		{
			case ">":
				if ( (nodeVal) > parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " is >   " + val + " for their attribute " + attr);
					foundAttrs++;
				}
				break;
			case "<":
				if ( (nodeVal) < parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " is <   " + val + " for their attribute " + attr);
					foundAttrs++;
				}
				break;
			case ">=":
				if ( (nodeVal) >= parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " is >= " + val + " for their attribute " + attr);
					foundAttrs++;
				}
				break;
			case "<=":
				if ( (nodeVal) <= parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " is <=  " + val + " for their attribute " + attr);
					foundAttrs++;
				}
				break;
			case "!=":
				if ( (nodeVal) != parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " is !=  " + val + " for their attribute " + attr);
					foundAttrs++;
				}
				break;
			default:
				if ( (nodeVal) == parseFloat(val) )
				{
					MessageLog.trace( node.getName( pegsFound[x] ) + " has the value of " + val + " in their attribute " + attr);
					foundAttrs++;
				}
		}
		
	}
	
	if (foundAttrs > 0)
	{
		MessageBox.information("Found " + foundAttrs + " with requested info. Check Message Log");
	}
	
	return;
}