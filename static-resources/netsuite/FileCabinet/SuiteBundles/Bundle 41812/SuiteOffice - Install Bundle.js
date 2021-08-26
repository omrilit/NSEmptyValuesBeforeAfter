/****************************************************************
 * Description: Install Bundle. 
 * 
 * @author: Alfonso Terron
 * @Email : aterron@netsuite.com
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @version 1.0                                 @Date: 14/08/2014 
 * 
 ****************************************************************/

function installBundle(toversion){
	
	var install = {
			
			folderWasProcess : [],
			
			//** Load Site Folder
			getSiteFolder : function(){
				try{					
					var self     = this,
					name         = 'site',
					parentID     = 1,				
					folderSiteID = null;
					folderSiteID = self.existFolder(parentID, name);
					if(!folderSiteID)
						return self.createFolder(parentID, name, true);					
					return folderSiteID;
				}catch(e){nlapiLogExecution('ERROR', 'error: getSiteFolder', e);}
			},
			
			//** Load Install Folder
			getInstallFolder : function(installVersion){
				try{
					filter = [ new nlobjSearchFilter('name', null, 'is', installVersion) ],
					result = nlapiSearchRecord('folder', null, filter);
					return result ? result[0].getId() : null;
				}catch(e){ nlapiLogExecution('ERROR', 'error: getInstallFolder', e); }
			},
			
			getFolder : function(parentID){
				try{						
					filter = [ new nlobjSearchFilter('parent', null, 'is', parentID) ],
					column = [ new nlobjSearchColumn('name') ];						
					return nlapiSearchRecord('folder', null, filter, column);					
				}catch(e){nlapiLogExecution('ERROR', 'error: getFolder', e);}	
			},
			
			getFiles : function(parentID){					
				var fileid  = new nlobjSearchColumn('internalid', 'file'),
				filesResult = nlapiSearchRecord('folder', null ,[new nlobjSearchFilter('internalid', null, 'is', parentID)],[fileid]);			
				return filesResult;
			},

			//** Check exist folder and return id or null.
			existFolder : function(parentid, name){
				try{
					filter = [ new nlobjSearchFilter('name', null, 'is', name), new nlobjSearchFilter('parent', null, 'is', parentid) ],
					result = nlapiSearchRecord('folder', null, filter);					
					return result ? result[0].getId() : null;
				}catch(e){nlapiLogExecution('ERROR', 'error: existFolder', e);}
			},
			
			//** Create folder with parent.
			createFolder : function(parentID, name, _retObj){
				try{
					
					var folderSite = nlapiCreateRecord('folder');
					folderSite.setFieldValue('parent', parentID);
					folderSite.setFieldValue('name', name);					
					
					folderID = nlapiSubmitRecord(folderSite);
					
					if(_retObj)
						return folderID;
					
				}catch(e){nlapiLogExecution('ERROR', 'error: createFolder', e);}					
			},		
			
			//** Copy all files and folder of (fromFolder).
			copyFolder : function(fromFolder, toFolder, margeFiles){

				try{
					
					if(!fromFolder || !toFolder) return;
					
					//** Declare varials
					var self = this,
					folders  = self.getFolder(fromFolder),
					files    = self.getFiles(fromFolder);
					
					//nlapiLogExecution('ERROR', 'e', JSON.stringify(folders));
					
					//** Process Folders
					if(folders && folders.length)
						for(f in folders){
							var folder      = folders[f],
							currentFolderID = null;
							
							if(margeFiles)
								currentFolderID = self.existFolder(toFolder,folder.getValue('name'));
							
							currentFolderID = currentFolderID ? currentFolderID : self.createFolder(toFolder,folder.getValue('name'), true);
							self.copyFolder(folder.getId(), currentFolderID, margeFiles);
						}
					
					//** Process Files
					if(files && files.length)
						for(f in files){
							var file = files[f],
							columns = file.getAllColumns();
							fileID   = file.getValue(columns[0]);
							file     = nlapiLoadFile(fileID);
							
							if(file.getType() === 'MISCBINARY') continue;
							
							var newfile = nlapiCreateFile(file.getName(), file.getType(), file.getValue());
							newfile.setIsOnline(true);
							newfile.setFolder(toFolder);
							
							nlapiSubmitFile(newfile);
						}
				}catch(e){ nlapiLogExecution('ERROR', 'error: copyFolder', e); }
			},
			
			nameInstallFolder : 'suiteoffice',
			
			suiteOfficeInstall : function(folderVersion, mergeFiles){					
				var self        = this,				
				siteID          = self.getSiteFolder(),
				suiteofficeID   = self.existFolder(siteID, self.nameInstallFolder),
				installFolderID = self.getInstallFolder(folderVersion);
				
				if(!suiteofficeID)
					suiteofficeID = self.createFolder(siteID, self.nameInstallFolder, true);
				
				if(installFolderID && suiteofficeID)
					self.copyFolder(installFolderID, suiteofficeID, mergeFiles);
			
			}
	};
	
	nlapiLogExecution('ERROR', 'Install Version:', toversion);
	
	if(toversion.match('1.1-b'))
		install.suiteOfficeInstall('suiteoffice_basic');		
	if(toversion.match('1.1-s')) //('versionFolderName', MergeFiles)
		install.suiteOfficeInstall('suiteoffice_standard', true);
	if(toversion.match('1.1-p')) //('versionFolderName', MergeFiles)
		install.suiteOfficeInstall('suiteoffice_premium', true);	
		
}