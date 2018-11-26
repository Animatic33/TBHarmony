
function switchColourArtToLine() {
	scene.beginUndoRedoAccum("AG_ColourArtToLineArt");
		
	var selectedNodes = [];
	for (var indx in selection.selectedNodes())
	{
		selectedNodes.push( selection.selectedNode(indx) );
	}
		
	for (var xInt in selectedNodes)
	{
		var selNode = selectedNodes[xInt]; 
		var parGroup = node.parentNode(selNode);
		var srcNode = node.srcNodeInfo( selNode , 0);
		
		var xCoord = node.coordX(selNode);
		var yCoord = node.coordY(selNode);
		var zCoord = node.coordZ(selNode);
		
		MessageLog.trace("----\n" + selNode + "\n" + parGroup + "\n" + srcNode.node + " \n" + srcNode.port + "\n" + xCoord + "\n" + yCoord + "\n" + zCoord + "\n -----")
		
		var newNodeType = ["",""];
		
		// A reversal of types rather than switch just to line art.
		if (node.type( selNode ) == "COLOR_ART" )
		{
			newNodeType[0] = "Line-Art";
			newNodeType[1] = "LINE_ART";
		}
		
		if (node.type( selNode ) == "LINE_ART" )
		{
			newNodeType[0] = "Colour-Art";
			newNodeType[1] = "COLOR_ART";
		}
		
		if (node.type( selNode ) == "UNDERLAY" )
		{
			newNodeType[0] = "Overlay-Layer";
			newNodeType[1] = "OVERLAY";
		}
		
		if (node.type( selNode ) == "OVERLAY" )
		{
			newNodeType[0] = "Underlay-Layer";
			newNodeType[1] = "UNDERLAY";
		}
		
		var newNode = node.add(parGroup, newNodeType[0], newNodeType[1], xCoord, yCoord, zCoord);
		
		var linksrc = node.link(srcNode.node, srcNode.port, newNode, 0, false, false);
		
		var numOutputLinks = node.numberOfOutputLinks( selNode, 0);
		
		var outputArray = []; // this will be a permanent record of all the links to the selected node
		
		for (var x= 0; x < numOutputLinks; x++ ) 
		{
			var dstNode = node.dstNodeInfo( selNode , 0, x);
			outputArray.push( [ x, dstNode.node, dstNode.port ] );			
		}
		
		for (var x= 0; x < outputArray.length; x++)	
		{
			MessageLog.trace("<< Unlinking " + outputArray[x][1] + " on port " + outputArray[x][2]); 
			node.unlink(outputArray[x][1], outputArray[x][2]);
			
			MessageLog.trace(">> Linking " + newNode + " on port 0 to " + outputArray[x][1] + " on port " + outputArray[x][2]);
			var linkdst = node.link(newNode, 0, outputArray[x][1], outputArray[x][2] );
		}
		
		
		if (linksrc == true && linkdst == true)
		{
			node.deleteNode(selNode);
		}
		else
		{
			MessageBox.information("Link failed. Results: \n Link Source" + linksrc + "\n Link Destination:" + linkdst);
			
		}
				
		selection.addNodeToSelection(newNode);
		
	}
	
	scene.endUndoRedoAccum();
}