/*
Harmony JS Object Wrappers - Andrew Glisinki 
Started May 24 2018
Last Update August 2 2018

-- Aug 2
	Intro'd selection object with methods pertaining to selected nodes.
*/

// Because functions in JS don't have a default argument value feature
// equivalent to (testArg = val) in a function argument list
function dArgVal(argToCheck, defVal)
{
	if (argToCheck == undefined) 
	{
		return defVal;
	}
	else
	{
		return argToCheck;
	}
}


/*
	********************
	HNode CLASS
	********************
	What?
	This is a node object wrapper. To instantiate, provide a node path
	or if no node path is provided, it will attempt to instantiate
	from the 0 index of the selection object's selectedNodes.
	
	Why?
	In order to better adhere to O-O ideologies, all node information should
	contained together as a coherent object that one can reference it's information
	at any point in time.
	
	Ported and Enhanced:
	Each HNode property calls the equivalent node function to update it's status at
	any point in it's life cycle. 
	
	All methods associated with setting/linking etc. have been ported over to
	this node as is. In the case of multi-setting of coordinates, I have simplified
	it down to just setCoord with the ability to set each or all of the coordinates
	at once.
	
	Additions / Changes:
	> iPorts & oPorts:
	  These are generated arrays of all in and out ports of the given node.
	  They contain each an indexed [ nodeName, portNum, optionalLinkNum ] for each entry.
	  
	> attrList:
	  This is an array of attribute objects passed back by Harmony, parsed into human-readable
	  "dictionary" of [Attr Name] = [keyword, value at current frame].
	
	> coord:
	  An array of all coords.
	  
	> set enable/locked methods - these act like toggles if no value is passed to them.
	
	> setAttr - short-form variation of setTextAttr
	

*/

exports.HNode = function(nodePath) 
{	
	this.nodePath = dArgVal( nodePath, selection.selectedNode(0) );
	
	if ( this.nodePath == "" || this.nodePath == undefined)
	{
		MessageLog.trace("couldn't instantiate a new node object");
		return false;
	}
	else
	{
		//MessageLog.trace("instantiating " + this.nodePath + " object.");
	}
	
	//HOTFIX: Don't create HNodes for Multi-Port types
	if ( this.nodePath.indexOf("Multi-Port") != -1 )
	{
		MessageLog.trace("HNode currently does not support multi-port nodes");
		return;
	}
	
	// Basic attributes of a node
	this.name = node.getName( this.nodePath );
	this.parentNode = node.parentNode( this.nodePath );
	
	this.root = node.root( this.nodePath );
	this.isGroup = node.isGroup( this.nodePath );
	this.type = node.type( this.nodePath );
	
	if (this.isGroup == true)
	{
		this.numberOfSubNodes = node.numberOfSubNodes( this.nodePath );
		this.subNodes = node.subNodes(this.nodePath);
	}
	
	this.groupAtNetworkBuilding = node.groupAtNetworkBuilding( this.nodePath );
	this.timelineTagList = node.getTimelineTagList( this.nodePath );
	
	this.matrix = node.getMatrix( this.nodePath, 0 );
	this.pivot = node.getPivot( this.nodePath, 0 );
	
	this.coordX = node.coordX( this.nodePath );
	this.coordY = node.coordY( this.nodePath );
	this.coordZ = node.coordZ( this.nodePath );
	this.coord = [this.coordX, this.coordY, this.coordZ];
	
	this.width = node.width( this.nodePath );
	this.height = node.height( this.nodePath );
	
	this.enable = node.getEnable( this.nodePath );
	this.locked = node.getLocked( this.nodePath );
	this.timelineTag = node.getTimelineTag( this.nodePath );
	this.color = node.getColor( this.nodePath );
	
	this.elementId = node.getElementId( this.nodePath );
		
	
	// Attribute Info
	// Populates an object "dictionary" off attributes and their values. Provides an 
	// additional Attribute object as well.
	this.attrObjList = node.getAttrList( this.nodePath, 0 ); // This is a list of Attribute Objects
	
	this.attrList = {};
	
	if (this.attrObjList.length != 0)
	{
		for (var x = 0; x < this.attrObjList.length; x++) 
		{
			var attrName = this.attrObjList[x].name();
			var attrKeyword = this.attrObjList[x].keyword();
			var attrType = this.attrObjList[x].typeName();
			var attrVal = "";
			
			switch(attrType) 
			{
				case "ALIAS":
					attrVal = this.attrObjList[x].textValue();
				break;
				
				case "BOOL":
					attrVal = this.attrObjList[x].boolValue();
				break;
				
				case "DOUBLE":
					attrVal = this.attrObjList[x].doubleValue();
				break;
				
				case "GENERIC_ENUM":
					attrVal = this.attrObjList[x].intValue();
				break;
				
				case "INT":
					attrVal = this.attrObjList[x].intValue();
				break;
				
				case "POSITION_3D":
					attrVal = this.attrObjList[x].pos3dValue();
				break;
				
				case "POSITION_2D":
					attrVal = this.attrObjList[x].pos2dValue();
				break;
				
				case "ROTATION_3D":
					attrVal = this.attrObjList[x].pos3dValue();
				break;
				
				case "ROTATION_2D":
					attrVal = this.attrObjList[x].pos2dValue();
				break;
				
				case "SCALE_3D":
					attrVal = this.attrObjList[x].pos3dValue();
				break;
							
				case "SCALE_2D":
					attrVal = this.attrObjList[x].pos2dValue();
				break;
				
				default:
					attrVal = this.attrObjList[x].textValue();
			}
			
			this.attrList[ attrKeyword ] = [ attrName, attrVal, attrType ];
			
		}
	}
	
	this.attrKeywords = [];
	
	if (this.attrObjList.length != 0)
	{
		for (var x = 0; x < this.attrObjList.length; x++) 
		{
			this.attrKeywords.push( this.attrObjList[x].keyword() );
		}
	}
	
	// Port Info
	// Populates an array of attached nodes to this node. Both source and destination.
	
	this.nIPorts = node.numberOfInputPorts(this.nodePath);
	this.iPorts = [];
	
	if (this.nIPorts != 0)
	{
		for (var x = 0; x < this.nIPorts;x++)
		{
			this.sourceNode = node.srcNodeInfo(this.nodePath, x);
			
			// A port may be empty on a node, if that's the case, don't populate it atm
			if (this.sourceNode !== undefined)
			{
				this.iPorts.push( [this.sourceNode.node, this.sourceNode.port] ); 
			}
		}
	}
	
	this.nOPorts = node.numberOfOutputPorts(this.nodePath);
	this.oPorts = [];
	
	if (this.nOPorts != 0)
	{
		for (var x = 0; x < this.nOPorts; x++)
		{
			this.nOLinks = node.numberOfOutputLinks(this.nodePath, x);
			for (var y = 0; y < this.nOLinks; y++)
			{
				this.destNode = node.dstNodeInfo(this.nodePath, x, y);
				this.oPorts.push( [this.destNode.node, this.destNode.port, y] ); // include the link number just for ordering purposes
			}
		}
	}
	
};

// GETTERS for Node Related Stuff

exports.HNode.prototype.getSubnodes = function(typeFilter, isEnable)
{
	this.filterSubNodes = [];
	// Returns a list of subnode paths that meet a criteria
	if (this.type == "GROUP")
	{
		for (var i = 0; i < this.subNodes.length; i++)			
		{
			if (node.type( this.subNodes[i] ) == typeFilter && node.getEnable( this.subNodes[i]) == isEnable ) 
			{
				this.filterSubNodes.push( this.subNodes[i] );
			}
		}
		
		return this.filterSubNodes;
		
	}
	else
	{
		return false;
	}
	
};


// Setters for Node Properties
exports.HNode.prototype.setCoord = function(xC, yC, zC) 
{
	// Undefined args
	xC = dArgVal(xC, this.coordX);
	yC = dArgVal(yC, this.coordY);
	zC = dArgVal(zC, this.coordZ);
	
	//MessageLog.trace(this.nodePath + " coords were [" + this.coord + "]");
	
	if ( node.setCoord( this.nodePath, xC, yC, zC) == true )
	{
		// Update the object's coordinates
		this.coordX = xC;
		this.coordY = yC;
		this.coordZ = zC;
		this.coord = [this.coordX, this.coordY, this.coordZ];
		
		//MessageLog.trace(">> Set " + this.nodePath + " coords to [" + this.coord + "]");
		
		return true;
	}
	else { return false; }
};

exports.HNode.prototype.setEnable = function(val) 
{
	var defVal = true;
	if (this.enable == true)
	{
		defVal = false;
	}
	
	val = dArgVal(val, defVal);
	
	if (node.setEnable( this.nodePath, val) == true ) { return val; }
	else { return val; }
};

exports.HNode.prototype.setLocked = function(val) 
{
	var defVal = true;
	if (this.locked == true)
	{
		defVal = false;
	}
	
	val = dArgVal(val, defVal);
	
	if (node.setLocked( this.nodePath, val) == true ) { return val; }
	else { return val; }
};

exports.HNode.prototype.setTimelineTag = function(val) 
{
	val = dArgVal(val, this.timelineTag);
	
	if (node.setTimelineTag( this.nodePath, val) == true ) { return true; }
	else { return false; }
};

exports.HNode.prototype.setColor = function(val) 
{
	val = dArgVal(val, this.color);
	
	if (node.setColor( this.nodePath, val) == true ) { return true; }
	else { return false; }
};



// Node specific methods

exports.HNode.prototype.link = function(dstNodeSpecify, srcPort, dstPort , mayAddOutputPort, mayAddInputPort) 
{
	//MessageLog.trace("attempting to link");
	var dstNodeName = "";
	
	if(typeof dstNodeSpecify === 'object')
	{
		dstNodeName = dstNodeSpecify.nodePath;
	}
	else
	{
		dstNodeName = dstNodeSpecify;
	}
	
	//MessageLog.trace("got node path");
	
	// Undefined args
	dstPort = dArgVal(dstPort, 0);
	srcPort = dArgVal(srcPort, 0);
	mayAddOutputPort = dArgVal(mayAddOutputPort, false);
	mayAddInputPort = dArgVal(mayAddInputPort, false);
	
	MessageLog.trace(dstNodeName + " " + dstPort+ " " + srcPort+ " " + mayAddOutputPort + " " + mayAddInputPort);
	
	try {
		node.link( this.nodePath, srcPort, dstNodeName, dstPort, mayAddOutputPort, mayAddInputPort);
	}
	catch(err) {
		MessageLog.trace(err.message);
		return false;
	}
	/*
	if (  == true ) 
	{
		return true;
	}
	else
	{
		return false;
	}
	*/
};

exports.HNode.prototype.subNode = function(iSubNode)
{
	return node.subNode( this.nodePath, iSubNode);
};

exports.HNode.prototype.resetColor = function()
{
	return node.resetColor( this.nodePath );
};

exports.HNode.prototype.noNode = function()
{
	return node.noNode();
};

exports.HNode.prototype.getTextAttr = function(atFrame, attrName)
{
	return node.getTextAttr( this.nodePath, atFrame, attrName );
};

exports.HNode.prototype.getAttr = function(atFrame, attrName) 
{
	// Returns an Attribute object
	return node.getAttr( this.nodePath, atFrame, attrName);
};

exports.HNode.prototype.linkedColumn = function(attrName)
{
	return node.linkedColumn( this.nodePath, attrName );
};

exports.HNode.prototype.isLinked = function(iPort)
{
	return node.isLinked( this.nodePath, iPort);
};


// Node Editing Methods
exports.HNode.prototype.deleteNode = function(deleteTimedValues, deleteElements)
{
	deleteTimedValues = dArgVal(deleteTimedValues, false);
	deleteElements = dArgVal(deleteElements, false);
	
	node.deleteNode(this.nodePath);
	delete this;
};

exports.HNode.prototype.rename = function(newName)
{
	var newName = node.rename( this.nodePath, newName );
	this.name = node.getName( this.nodePath );
	return newName;
};

exports.HNode.prototype.createDynamicAttr = function(attrName, displayName, linkable)
{
	attrName = dArgVal(attrName, "");
	displayName = dArgVal(displayName, "");
	linkable = dArgVal(linkable, false);
	
	return node.createDynamicAttr(this.nodePath, attrName, displayName, linkable);
};

exports.HNode.prototype.removeDynamicAttr = function(attrName)
{
	attrName = dArgVal(attrName, "");
	
	return node.createDynamicAttr(this.nodePath, attrName);
};

exports.HNode.prototype.setTextAttr = function(attrName, atFrame, attrValue)
{
	attrName = dArgVal(attrName, "");
	atFrame = dArgVal(atFrame, 0);
	attrValue = dArgVal(attrValue, 0);
	
	return node.setTextAttr( this.nodePath, attrName, atFrame, attrValue );
};

exports.HNode.prototype.setAttr = function(attrName, atFrame, attrValue)
{
	// short form for setTextAttr
	return exports.HNode.prototype.setTextAttr(attrName, atFrame, attrValue);
};


exports.HNode.prototype.linkAttr = function(attrName, columnName)
{
	attrName = dArgVal(attrName, "");
	columnName = dArgVal(columnName, 0);
	
	return node.linkAttr( this.nodePath, attrName, columnName );
};

exports.HNode.prototype.unlinkAttr = function(attrName)
{
	attrName = dArgVal(attrName, "");
	
	return node.unlinkAttr( this.nodePath, attrName);
};

exports.HNode.prototype.unlink = function(dstNode, inPort)
{
	dstNode = dArgVal(dstNode, "");
	inPort = dArgVal(inPort, "");
	
	return node.unlink( dstNode, inPort);
};





/*
	********************
	SelectedNodes CLASS
	********************
	What?
	This instantiates a list of selected nodes, it's tied to common methods
	of sorting the list, getting types of objects from a selection etc.
	
	The type of var return from it's method is specified in the method call.
	
*/

/*
exports.SelectedNodes = function(elementType)
{
	elementType = dArgVal(elementType, "HNode");
	
	this.rawList = selection.selectedNodes();
	this.elType = elementType; // used as a quick ref point for determining what's in the list
	this.nodesList = [];
	
	if (elementType == "HNode")
	{
		for (var i = 0; i < rawList.length; i++)		
		{
			this.nodesList.push( new exports.HNode( rawList[i] );
		}
	}
	else
	{
		this.nodesList = this.rawList.splice(0, rawList.length);
	}
	
};

exports.SelectedNodes.prototype.list = function(returnType, order, ofType)
{
	this.listToReturn = [];
	
	// order = X, Y, Z (coords), Asc, Desc, raw*
	order = dArgVal(order, "raw");
	
	// ofType = **any node type, all*
	ofType = dArgVal(ofType, "all");
	
	if 
	for (var i = 0; i < this.nodesList.length; i++)
	{
	}
	
};
*/


/*
	********************
	HElement CLASS
	********************
	What?
	This is a element object wrapper. To instantiate, provide a node path
	or if no node path is provided, it will attempt to instantiate
	from the 0 index of the selection object's selectedNodes.
	
	
	Ported and Enhanced:
	Each HElement property calls the equivalent element function to update it's status at
	any point in it's life cycle. 
	
	
	Additions / Changes:
	>
	

*/

/*
exports.HElement = function(ref)
{
	this.nodePath = dArgVal( ref, selection.selectedNode(0) );
	
	if ( this.nodePath == "" || this.nodePath == undefined)
	{
		MessageBox.warning("couldn't instantiate a new element object");
		return 0;
	}
	else
	{
		MessageLog.trace("instantiating " + this.nodePath + " object.");
	}
	
	
	
	// Instantiate a new HNode Object?
	this.refNode = new exports.HNode(this.nodePath);
	
	this.id = element.id( this.refNode.elementId );
	this.
	
};*/

/* TEMPLATE FOR METHODS
exports.HNode.prototype.setCoord = function()
{
	
};
*/