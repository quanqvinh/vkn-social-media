module.exports = {
	async commitWithRetry(session) {
		try {
			await session.commitTransaction();
			console.log('Transaction committed.');
		} catch (error) {
			if (error.hasErrorLabel('UnknownTransactionCommitResult')) {
				console.log('UnknownTransactionCommitResult, retrying commit operation ...');
				await commitWithRetry(session);
			} 
			else if (error.hasErrorLabel('TransientTransactionError')) {
				console.log('TransientTransactionError, retrying commit operation ...');
				await commitWithRetry(session);
			}
			else {
				console.log('Error during commit ...');
				throw error;
			}
		}
	}
};