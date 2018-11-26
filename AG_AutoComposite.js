// Auto-setup composite from selected.

var agn = require("AG_HarmonyObjLib.js");
var agf = require("AG_HarmonyFuncLib.js");

function autoComposite()
{
	scene.beginUndoRedoAccum("AG_AutoComposite");
	autoCompositeRun();
	scene.endUndoRedoAccum();
}

function autoCompositeRun()
{
	var selNodes = selection.selectedNodes();
	var firstNodeObj = new agn.HNode();
	var parentGrp = firstNodeObj.parentNode;
	var heightDiff = 50;
	
	var nodeInfo = agf.sortNodes(selNodes, "X");
	
	var compXCoord = (((nodeInfo[nodeInfo.length - 1][1] - nodeInfo[0][1]) / 2) + nodeInfo[0][1]); 
	
	var compNode = node.add(parentGrp, "Composite","COMPOSITE", x=compXCoord, y=firstNodeObj.coordY + heightDiff * 2, z=firstNodeObj.coordZ);
	var compNodeObj = new agn.HNode(compNode);
	compNodeObj.setTextAttr("COMPOSITE_MODE", 1, "Pass Through");
	
	for (var x = 0 ; x < nodeInfo.length; x++)
	{
		var tempNodeObj = new agn.HNode(nodeInfo[x][0]);
		tempNodeObj.link( compNodeObj, 0, 0, false, true );
	}
}