import {IonTypes, makeReader, makeTextWriter} from 'ion-js';

const {registerSuite} = intern.getPlugin('interface.object');
const {assert} = intern.getPlugin('chai');

import {cryptoIonHasherProvider, makeHashReader, makeHashWriter} from '../src/IonHash';
import {toHexString} from './testutil';

registerSuite('CryptoIonHasherProviderTests', {
    cryptoMD5reader: () => {
        let str = '[1, 2, {a: 3, b: (4 {c: 5} 6) }, 7]';
        let expectedDigest = 'dd 20 84 69 9a 2e 85 fe ef 64 c8 79 57 b6 9f cd';

        let hashReader = makeHashReader(makeReader(str), cryptoIonHasherProvider('md5'));
        hashReader.next();
        hashReader.next();
        let actualDigest = hashReader.digest();

        assert.equal(toHexString(actualDigest), expectedDigest);
    },

    cryptoMD5writer: () => {
        let expectedIon = '[1,2,{a:3,b:(4 {c:5} 6)},7]';
        let expectedDigest = 'dd 20 84 69 9a 2e 85 fe ef 64 c8 79 57 b6 9f cd';

        let writer = makeTextWriter();
        let hashWriter = makeHashWriter(writer, cryptoIonHasherProvider('md5'));

        hashWriter.stepIn(IonTypes.LIST);
          hashWriter.writeInt(1);
          hashWriter.writeInt(2);
          hashWriter.stepIn(IonTypes.STRUCT);
            hashWriter.writeFieldName('a');
            hashWriter.writeInt(3);
            hashWriter.writeFieldName('b');
            hashWriter.stepIn(IonTypes.SEXP);
              hashWriter.writeInt(4);
              hashWriter.stepIn(IonTypes.STRUCT);
                hashWriter.writeFieldName('c');
                hashWriter.writeInt(5);
              hashWriter.stepOut();
              hashWriter.writeInt(6);
            hashWriter.stepOut();
          hashWriter.stepOut();
          hashWriter.writeInt(7);
        hashWriter.stepOut();

        let actualDigest = hashWriter.digest();
        assert.equal(toHexString(actualDigest), expectedDigest);
        assert.equal(String.fromCharCode.apply(null, hashWriter.getBytes()), expectedIon);
        assert.equal(String.fromCharCode.apply(null, writer.getBytes()), expectedIon);
    },

    unknownAlgorithm: () => {
        assert.throws(() => {
            makeHashWriter(makeTextWriter(), cryptoIonHasherProvider('unknownAlgorithm'))
        });
    },
});

