// Sanity Checker for Toonboom by Andrew Glisinski (2018)

// TODO: - Check disabled reads to ensure they have a drawing specified.

// public arrays
var readsToEdit = [];
var compsToEdit = []; 
var pegsToEdit = [];
var groupsToEdit = [];

var deformWarnings = 0;
var pivotWarnings = 0;
var readWarnings = 0;
var singlePegParentWarnings = 0;

// CHECKS GO HERE
function setImgPivot(readToSet) {
	node.setTextAttr( readToSet, "USE_DRAWING_PIVOT", 1, "Y" );
	return;
}



function setCompToPassThrough(compToSet) {
	node.setTextAttr(compToSet, "COMPOSITE_MODE", 1, "Pass Through");
	return;	
}



function setPegToSeparate(pegToSet) {
	node.setTextAttr( pegToSet, "OFFSET.SEPARATE", 1, "Y" );
	node.setTextAttr( pegToSet, "POSITION.SEPARATE", 1, "Y" );
	return;
}



function checkDeformDisabledDrawing() {
	var deformGroups = [];
	var deformsToCheck = [];
	
	for (var x = 0; x < groupsToEdit.length; x++)
	{
		if ( groupsToEdit[x].search("Deform") > 0) 
		{
			deformGroups.push(groupsToEdit[x]);
		}
	}
		
	
	if (deformGroups.length > 0) 
	{
		for (var x = 0; x < deformGroups.length; x++)
		{
			var parentPeg = node.srcNode(deformGroups[x], 0);
			var readFound = false;
			
			// See if the deformation group's parent peg has a drawing attached to it
			
			if (parentPeg != "" && node.type(parentPeg) == "PEG") 
			{
				var numOutputLinks = node.numberOfOutputLinks(parentPeg, 0);
				
				if ( numOutputLinks >= 1 ) 
				{ 
					for (var y = 0; y < numOutputLinks; y++) 
					{
						if ( node.type( node.dstNode(parentPeg,0, y) ) == "READ" ) 
						{
							readFound = true;
						}
					}
					
					if (readFound == false)
					{
						deformsToCheck.push(deformGroups[x]); // this is simplified for now, should be more verbose
					}
					
				}
			}
		}
	}
	
	if (deformsToCheck.length > 0)
	{
		for (var x = 0; x < deformsToCheck.length; x++)
		{
			MessageLog.trace(deformsToCheck[x] + "'s parent is missing another output. Check this out."); // for now, just a message
			deformWarnings++;
		}
	}
	
	return;
}



function checkPivotForZero(pegToCheck) // Make sure pivots are set to 0,0. If not, let the console log which ones are not.
{
	var checkPivotList = [];
	if (node.getTextAttr(pegToCheck, 0, "pivot.x") != "0.0000" || node.getTextAttr(pegToCheck, 0, "pivot.y") != "0.0000")
	{
		checkPivotList.push(pegToCheck);
	}

	for (var x = 0; x < checkPivotList.length; x++)
	{
		MessageLog.trace(checkPivotList[x] + " has a non zero pivot, check this.");
		pivotWarnings++;
	}
}


function checkPegForMultiPegs(pegToCheck)  
{
	// Check that all pegs that have a peg as a child, have more than 1 peg child.
	// If the peg only has 1 child peg, see whether the read attached is disabled.
	// If there is only 1 read and it's enabled, then that's fine
	//                                           then it might be redundant
	
	var numOfPegs = 0;		
	var numOutputLinks = node.numberOfOutputLinks(pegToCheck, 0);
	var disabledReads = 0;
	
	for (var y = 0; y < numOutputLinks; y++ )
	{
		var destNode = node.dstNode(pegToCheck, 0, y);
		
		if (node.type( destNode ) == "PEG" )
		{
			numOfPegs++;
		}
		
		if (node.type( destNode ) == "READ" )
		{
			if (node.getEnable( destNode ) == false)
			{
				disabledReads++;
			}
		}
	}
	
	if (numOfPegs == 1)
	{
		if (disabledReads == 1)
		{
			MessageLog.trace(">> Peg " + pegToCheck + " has only one child peg.");
			singlePegParentWarnings++;
		}
	}
	
	return;
}



/*function checkReadForAttrValues(readToCheck)
{
	var attrs = ["POSITION.x", "POSITION.y", "POSITION.z", 
				 "SCALE.x", "SCALE.y", "SCALE.z",
				 "ANGLE.z",
				 "SKEW",
				];
				
	var checkReadAttr = [];

	for (var x in attrs)
	{
		if (checkReadAttr.indexOf(readToCheck) == -1) // skip any reads that are already found in the checked reads array
		{
			if ( node.getTextAttr(readToCheck, 0, attrs[x]) != "" ) // a attr will be a blank string if nothing is attached to it
			{
				MessageLog.trace("!!! " + readToCheck + " has a non blank string for attr [" + attrs[x] + "] !!!");
				checkReadAttr.push(readToCheck);
			}
		}
	}
	
	for (var x in checkReadAttr) 
	{
		MessageLog.trace(checkReadAttr[x] + " READ has some function curves associated with it. Check this.");
		readWarnings++;
	}
	
}*/


// END Check Functions


function selectNodes(parentGrp, typeToFind, selGroups) 
{
	var nNodes = node.numberOfSubNodes(parentGrp);
	
	for ( var i = 0; i < nNodes; i++)
	{
		var nodeName = node.subNode(parentGrp, i);
		var type = node.type(nodeName);

		if (type == typeToFind) {
			if (typeToFind == "READ") 
			{
				readsToEdit.push(nodeName);
			}
			
			if (typeToFind == "COMPOSITE")
			{
				if (parentGrp != "Top") {
					compsToEdit.push(nodeName); // leave "Top" level Composites as w/e they were b4.
				}
								
			}
			
			if (typeToFind == "PEG")
			{
				pegsToEdit.push(nodeName);
			}
		}
		
		if (type == "GROUP" && selGroups == 1)
		{
			groupsToEdit.push(nodeName);
		}
		
		if (type == "GROUP") {
			selectNodes(nodeName, typeToFind, selGroups);
		}
	
	}
	return;
}




function sanityCheck() {
	scene.beginUndoRedoAccum("AG_Sanity_Check");
	selectNodes("Top", "READ", 0);
	var readsLength = readsToEdit.length;
		
	// Set Reads to Publish Pivot to Parent
	for (var i = 0; i < readsLength; i++) 
	{
		setImgPivot(readsToEdit[i]);
	}
	
	// Set Composites to Pass Through
	selectNodes("Top", "COMPOSITE", 0);
	var compositeNodeLength = compsToEdit.length;
	
	for (var i = 0; i < compositeNodeLength; i++) 
	{
		if(compsToEdit[i].indexOf("_B") == -1) // comps with _B in the name will be ignored. "Bitmap specific nodes"
		{
			setCompToPassThrough(compsToEdit[i]);
		}
	}
	
	
	// Set Pegs to Separate
	selectNodes("Top", "PEG", 0);
	var pegNodeLength = pegsToEdit.length;
	
	
	for (var i = 0; i < pegNodeLength; i++) 
	{
		setPegToSeparate( pegsToEdit[i] );
	}
	
	for (var i = 0; i < pegNodeLength; i++) 
	{
		checkPivotForZero( pegsToEdit[i] );    // Check for non-zero pivots on pegs
		checkPegForMultiPegs( pegsToEdit[i] ); // Check for pegs with only one peg extra attached.
	}
	
	
	
	// Check for non-zero transforms on reads
	/*for (var i = 0; i < readsLength; i++) 
	{
		checkReadForAttrValues(readsToEdit[i]);
	}*/
	
	MessageLog.trace("-----------------");
	
	// Find Deform Group Nodes with parents with disabled drawings
	selectNodes("Top", "GROUP", 1);
	
	checkDeformDisabledDrawing();
	
	var pivotWarningMsg = "";
	var deformWarningMsg = "";
	//var readValWarningMsg = "";
	var singlePegParentMsg = "";
	var totalWarnings = singlePegParentWarnings + pivotWarnings + deformWarnings;
	
	if (pivotWarnings > 0) {
		pivotWarningMsg = pivotWarnings + " Non-Zero Pivots";
	}
	
	if (deformWarnings > 0) {
		deformWarningMsg = deformWarnings + " Deformers have parents with no disabled reads attached";
	}
	
	if (singlePegParentWarnings > 0) {
		singlePegParentMsg = singlePegParentWarnings + " Pegs have only one peg child";
	}
	
	/*if (readWarnings > 0) {
		readValWarningMsg = readWarnings + " Reads have function charts associated with them.";
	}*/
	
	
	
	if (totalWarnings > 0) 
	{
		MessageBox.information(totalWarnings + " Warnings found. \n" + 
							   deformWarningMsg + "\n" + 
							   pivotWarningMsg + "\n" +
							   singlePegParentMsg + "\n" +
							   "Composite Count" + compsToEdit.length + "\n");
	}
	
	scene.endUndoRedoAccum();
	
	return;
}
