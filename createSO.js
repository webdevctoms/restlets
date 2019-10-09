/**
 *@NApiVersion 2.0
 *@NScriptType RESTlet
 */

 define(['N/record','N/search'],function(record,search){
 		//find customer by email then return netsuite id
 		function checkForCustomer(email){
            
 			var customerSearch = search.create({
 				type:search.Type.CUSTOMER,
 				title:'Find duplicate customer',
 				columns:['internalid','entityid','email'],
 				filters:[['email','is',email]]
 			});

 			var results = customerSearch.run().getRange({start: 0, end: 1000});
 			log.debug ({
                title: 'Finding customer',
                details: results.length
            });
 			if(results.length === 1){
 				for (var i = 0; i < results.length; i++) {
	            	var internalid = results[i].getValue({
	            		name:'internalid'
	            	});

	            	var entityid = results[i].getValue({
	            		name:'entityid'
	            	});

	            	var email = results[i].getValue({
	            		name:'email'
	            	});

	            	var data = internalid + ' ' + entityid + ' ' + email;

	            	log.debug ({
		                title: 'Data',
		                details: data
	            	});

	            	return internalid;
	            }

	 		}

	 		else{
	 			return false;
	 		}
 		}
            

 		function createCustomer(context){
 			var custRec = record.create({
            	type:'customer'
            });

            custRec.setValue('entityid',context.entityid);
            custRec.setValue('email',context.email);
            custRec.setValue('shipaddr1',context.shipaddress);
 		}

 		function getItemId(context){

 		}

 		function buildAddressString(addressData){

 		}

 		function createItem(itemData,rec,subId){
 			//dynamically create line?
 			for (var i = 0; i < itemData.length; i++) {
 				var singleItemData = itemData[i];
 				for (var itemField in singleItemData) {
					if(singleItemData.hasOwnProperty(itemField)){
						rec.setSublistValue({
							sublistId:subId,
							fieldId:itemField,
							line:0,
							value:singleItemData[itemField]
						});
					}
				}
 			}
 		}

 		function createSO(context) {
 			log.debug ({
                title: 'create SO start',
                details: 'before creating data'
            });
 			try{

 				var customerId = checkForCustomer(context.order.email);
 				
 				log.debug ({
	                title: 'Create data',
	                details: context
	            });

 				if(customerId){
	            	context.order.entity = customerId;
	            }

	            else{
	            	customerId = createCustomer(context);
	            	//return 'done'
	            }

	            var rec = record.create({
	            	type:context.order.recordtype
	            });

				for (var fldName in context.order) {
					if(context.order.hasOwnProperty(fldName)){
						if(fldName !== 'recordtype' && fldName !== 'items'){
							rec.setValue(fldName,context.order[fldName]);
						}
						else if(fldName === 'items'){
							createItem(context.order[fldName],rec,'item');
						}
					}
				}
				var recordId = rec.save();
	            return String(recordId);
	            
	            //return 'done';
	            
 			}
 			catch(err){
 				log.error({
					title:err.name,
					details:err.message
				});
 			}
 			
        }
 	return{
 		post:createSO
 	};
 });