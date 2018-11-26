// Prefix All Reads of a Character to a Given Name or Scene Name
// May 15 2018 - Andrew Glisinski, Nelvana
// Oct 3 2018 - update to include any reads as well.
 
// How to Use:
// Select the group associated with the character. This script will rename all reads within that group node. If no group is selected, the script will fail.
// Enter a name in the dialog box. If the name is left blank, it will pre-pend the name of the scene 


var readsToEdit = [];
var ignoreList = ["TEXTURE_CONTROLS", "APPLY_TEXTURE", "Deformation"];


function preNameToReadsUI() // USE THIS FUNCTION
{
	if( node.type( selection.selectedNode(0) ) != "GROUP" || selection.numberOfNodesSelected == 0 )
	{
		MessageBox.warning("Must select a character's GROUP node before prefix naming.");
		return;
	}
	
	var dialog = new Dialog;
    var dialog_elements = [];
    var drawing_elements = [];
	
	dialog.caption = "Search and Replace"; // orig: Which Palette To Apply Across Cols
	dialog.okButtonText = "Rename"
	dialog.cancelButtonText = "Cancel";
	
	dialog_elements['replaceStr'] = new LineEdit;
	dialog_elements['replaceStr'].label = "Replace String (optional)";
    dialog.add( dialog_elements['replaceStr'] );
	
	dialog_elements['prefix'] = new LineEdit;
    dialog_elements['prefix'].label = "Prefix"; 
    dialog.add( dialog_elements['prefix'] );
	
	if ( dialog.exec() ) 
	{
		prependCharNameToReads( dialog_elements['prefix'].text, dialog_elements['replaceStr'].text);
	}
}


function selectReads(parentGrp, selGroups) 
{
	var nNodes = node.numberOfSubNodes(parentGrp);
	
	for ( var i = 0; i < nNodes; i++)
	{
		var nodeName = node.subNode(parentGrp, i);
		var type = node.type(nodeName);
		var ignoreElFound = false;
		
		for (var x = 0; x <= ignoreList.length; x++)
		{
			if (nodeName.indexOf(ignoreList[x]) != -1)
			{
				ignoreElFound = true;
				break;
			}
		}
		
		if (ignoreElFound == true)
		{
			continue;
		}
		

		if (type == "READ" || type == "PEG") 
		{
			readsToEdit.push(nodeName);
		}
		
		if (type == "GROUP") 
		{
			selectReads(nodeName);
		}
	
	}
	return;
}


function prependCharNameToReads(prefixName, replaceStr) 
{
	scene.beginUndoRedoAccum("AG_preNameToReads");
	
	// If the prefixName is blank, just take the scene name
	if (prefixName == "")
	{
		prefixName = scene.currentScene();
	}
	
	var selectedTopGroup = selection.selectedNode(0);
	
	selectReads(selectedTopGroup);
	
	if (readsToEdit.length == 0)
	{
		MessageLog.trace("no reads found?");
		return;
	}
	
	for (var x in readsToEdit) 
	{
		
		var nodeToEdit = readsToEdit[x];
		var nodeNameOrig = node.getName( nodeToEdit );
		
		if (nodeNameOrig.indexOf(prefixName) == -1) // if the prefix doesn't already exist in the string
		{
			if(replaceStr != "") // if the user has supplied a string to replace
			{
				var newNodeName = nodeNameOrig.replace(replaceStr, prefixName);
			}
			else
			{
				var newNodeName = prefixName + "_" + nodeNameOrig;
			}			
			
			var c = node.linkedColumn( nodeToEdit , "DRAWING.ELEMENT" );
			var e = column.getElementIdOfDrawing( c );
			element.renameById( e , newNodeName );
			
			
			if (node.rename( nodeToEdit , newNodeName) == true)
			{
				MessageLog.trace("Successfully renamed ");
			}
			else
			{
				MessageLog.trace("Failed to rename ");
			}
			
			MessageLog.trace(nodeToEdit + " to " + newNodeName);
		}
		
	}
	
	scene.endUndoRedoAccum();
	return;
}

