// Master Peg Renamer
// A Glisinski
/* function checkNodes(parentGrp, nameToFind) // WIP
{
	var nodeFound = "";
	var nNodes = node.numberOfSubNodes(parentGrp);
	var numNodes = 0;
	
	for ( var i = 0; i < nNodes; i++)
	{
		var nodeName = node.subNode(parentGrp, i);
		var type = node.type(nodeName);
		
		if (type == "GROUP") {
			checkNodes(nodeName, nameToFind);
			
			if (nodeName.search(nameToFind) != -1)
			{
				nodeFound = nodeName;
			}
		}
	}
	
	if (nodeFound != "")
	{
		return nodeFound +;
	}
} */


function MasterPegUpdate() {
	var dConst = new Date();
	var newDate = (dConst.getMonth()+1) + "_" + dConst.getDate() + "_" + dConst.getFullYear();
	
	var selectedNode = selection.selectedNode(0);
	var nodeType = node.type(selectedNode);
	var nodeName = scene.currentScene();
	
	if (nodeType == "PEG") 
	{
		nodeName = nodeName + "-P_" + newDate;
	}
	
	if (nodeType == "GROUP") 
	{
		nodeName = nodeName + "-G";
	}
	
	if (nodeType == "READ") // This renames the drawing element if there's one.
	{
		var c = node.linkedColumn( selectedNode , "DRAWING.ELEMENT" );
		var e = column.getElementIdOfDrawing( c );
		element.renameById( e , nodeName ); 
	}
	
	node.rename( selection.selectedNode(0) , nodeName);
	
	
	
	return;
}
