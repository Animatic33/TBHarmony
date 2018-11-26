// Duplicate Composite

var agn = require("AG_HarmonyObjLib.js");

function duplicateComposite() {
	scene.beginUndoRedoAccum("AG_duplicateNodes");
	
	var selCompObj = new agn.HNode( selection.selectedNodes() );
	
	var newComp = node.add(selCompObj.parentNode, 
							selCompObj.name, 
							"COMPOSITE",
							selCompObj.coordX + 100,
							selCompObj.coordY,
							selCompObj.coordZ
							);
								
	var newCompObj = new agn.HNode( newComp );

	MessageLog.trace(selCompObj.nIPorts);
	
	for (var x=0; x < selCompObj.nIPorts; x++)
	{
		var dstNodeObj = new agn.HNode( selCompObj.iPorts[x][0] );
		dstNodeObj.link( newCompObj, 0, x, false, true);
	}
	
	newCompObj.setTextAttr("COMPOSITE_MODE", 0, "Pass Through");
	
	scene.endUndoRedoAccum();
	return;
	
}