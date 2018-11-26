// Renaming Nodes to proper naming conventions
// Pegs - primarily for master pegs that need to be named a certain way
// Reads - duplicate reads with _1 or _2 usually are named "lines" or "inside"

var agn = require("AG_HarmonyObjLib.js");

function renameFunc(pegToRename, findSt, replaceSt)
{
	var oldName = "" + pegToRename.name;
	var newName = oldName.replace(findSt, replaceSt);
	pegToRename.rename( newName );
				
	if (pegToRename.name == oldName)
	{
		MessageLog.trace(selPeg.name + " obj still has old name: " + oldName);
		return false;
	}
	
	return true;
}

function renamePeg() {
	var pegsToRename = [];
	
	if (selection.selectedNodes.length > 1)
	{
		for (var i = 0; i < selection.selectedNodes.length; i++) 
		{
			pegsToRename.push( new agn.HNode( selection.selectedNodes[i] ) );
		}
	}
	else 
	{
		pegsToRename.push( new agn.HNode() );
	}

	
	for (var y = 0; y < pegsToRename.length; y++)
	{		
		var selPeg = pegsToRename[y];
		var oldName = "" + selPeg.name;
		var newName = selPeg.name;
		 
		var renameSuccess = false;
		
		var replacePattern = [["Top-P-P", "upper-M-P"], 
							  ["top-P-P", "upper-M-P"], 
							  ["Bot-P-P", "lower-M-P"],
							  ["bot-P-P", "lower-M-P"],
							  ["torso-M-P-P", "upperBody-M-P"],
							  ["Torso-M-P-P", "upperBody-M-P"],
							  ["torso-P-P", "upperBody-M-P"],
							  ["Torso-P-P", "upperBody-M-P"],
							  ["M-P-P", "M-P"], // this will conflict with the next name convention, fix later
							  ["P-P", "M-P"],
							  ["1_1", "2"],
							  ["2_1", "3"],
							  ["3_1", "4"]
							 ];
							 
		
		for (var i = 0; i < replacePattern.length; i++)
		{
			if ( selPeg.name.indexOf( replacePattern[i][0] ) !== -1)
			{
				renameFunc( selPeg, replacePattern[i][0], replacePattern[i][1] );
			}
		}
		
	}
}

