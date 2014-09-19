function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[21] = 0;
  _$jscoverage['/control.js'].lineData[41] = 0;
  _$jscoverage['/control.js'].lineData[48] = 0;
  _$jscoverage['/control.js'].lineData[49] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[55] = 0;
  _$jscoverage['/control.js'].lineData[56] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[61] = 0;
  _$jscoverage['/control.js'].lineData[70] = 0;
  _$jscoverage['/control.js'].lineData[74] = 0;
  _$jscoverage['/control.js'].lineData[77] = 0;
  _$jscoverage['/control.js'].lineData[82] = 0;
  _$jscoverage['/control.js'].lineData[85] = 0;
  _$jscoverage['/control.js'].lineData[86] = 0;
  _$jscoverage['/control.js'].lineData[90] = 0;
  _$jscoverage['/control.js'].lineData[95] = 0;
  _$jscoverage['/control.js'].lineData[96] = 0;
  _$jscoverage['/control.js'].lineData[97] = 0;
  _$jscoverage['/control.js'].lineData[102] = 0;
  _$jscoverage['/control.js'].lineData[103] = 0;
  _$jscoverage['/control.js'].lineData[109] = 0;
  _$jscoverage['/control.js'].lineData[110] = 0;
  _$jscoverage['/control.js'].lineData[111] = 0;
  _$jscoverage['/control.js'].lineData[112] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[118] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[123] = 0;
  _$jscoverage['/control.js'].lineData[124] = 0;
  _$jscoverage['/control.js'].lineData[128] = 0;
  _$jscoverage['/control.js'].lineData[129] = 0;
  _$jscoverage['/control.js'].lineData[135] = 0;
  _$jscoverage['/control.js'].lineData[141] = 0;
  _$jscoverage['/control.js'].lineData[148] = 0;
  _$jscoverage['/control.js'].lineData[156] = 0;
  _$jscoverage['/control.js'].lineData[157] = 0;
  _$jscoverage['/control.js'].lineData[158] = 0;
  _$jscoverage['/control.js'].lineData[159] = 0;
  _$jscoverage['/control.js'].lineData[167] = 0;
  _$jscoverage['/control.js'].lineData[168] = 0;
  _$jscoverage['/control.js'].lineData[169] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[174] = 0;
  _$jscoverage['/control.js'].lineData[179] = 0;
  _$jscoverage['/control.js'].lineData[180] = 0;
  _$jscoverage['/control.js'].lineData[185] = 0;
  _$jscoverage['/control.js'].lineData[192] = 0;
  _$jscoverage['/control.js'].lineData[193] = 0;
  _$jscoverage['/control.js'].lineData[205] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[210] = 0;
  _$jscoverage['/control.js'].lineData[220] = 0;
  _$jscoverage['/control.js'].lineData[224] = 0;
  _$jscoverage['/control.js'].lineData[225] = 0;
  _$jscoverage['/control.js'].lineData[235] = 0;
  _$jscoverage['/control.js'].lineData[236] = 0;
  _$jscoverage['/control.js'].lineData[237] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[242] = 0;
  _$jscoverage['/control.js'].lineData[255] = 0;
  _$jscoverage['/control.js'].lineData[258] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[260] = 0;
  _$jscoverage['/control.js'].lineData[262] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[265] = 0;
  _$jscoverage['/control.js'].lineData[268] = 0;
  _$jscoverage['/control.js'].lineData[269] = 0;
  _$jscoverage['/control.js'].lineData[271] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[279] = 0;
  _$jscoverage['/control.js'].lineData[280] = 0;
  _$jscoverage['/control.js'].lineData[292] = 0;
  _$jscoverage['/control.js'].lineData[294] = 0;
  _$jscoverage['/control.js'].lineData[295] = 0;
  _$jscoverage['/control.js'].lineData[300] = 0;
  _$jscoverage['/control.js'].lineData[301] = 0;
  _$jscoverage['/control.js'].lineData[313] = 0;
  _$jscoverage['/control.js'].lineData[314] = 0;
  _$jscoverage['/control.js'].lineData[323] = 0;
  _$jscoverage['/control.js'].lineData[324] = 0;
  _$jscoverage['/control.js'].lineData[328] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[338] = 0;
  _$jscoverage['/control.js'].lineData[339] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[345] = 0;
  _$jscoverage['/control.js'].lineData[346] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[357] = 0;
  _$jscoverage['/control.js'].lineData[358] = 0;
  _$jscoverage['/control.js'].lineData[360] = 0;
  _$jscoverage['/control.js'].lineData[364] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[375] = 0;
  _$jscoverage['/control.js'].lineData[376] = 0;
  _$jscoverage['/control.js'].lineData[377] = 0;
  _$jscoverage['/control.js'].lineData[385] = 0;
  _$jscoverage['/control.js'].lineData[387] = 0;
  _$jscoverage['/control.js'].lineData[388] = 0;
  _$jscoverage['/control.js'].lineData[389] = 0;
  _$jscoverage['/control.js'].lineData[390] = 0;
  _$jscoverage['/control.js'].lineData[391] = 0;
  _$jscoverage['/control.js'].lineData[402] = 0;
  _$jscoverage['/control.js'].lineData[466] = 0;
  _$jscoverage['/control.js'].lineData[467] = 0;
  _$jscoverage['/control.js'].lineData[469] = 0;
  _$jscoverage['/control.js'].lineData[519] = 0;
  _$jscoverage['/control.js'].lineData[520] = 0;
  _$jscoverage['/control.js'].lineData[565] = 0;
  _$jscoverage['/control.js'].lineData[567] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[569] = 0;
  _$jscoverage['/control.js'].lineData[571] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[575] = 0;
  _$jscoverage['/control.js'].lineData[578] = 0;
  _$jscoverage['/control.js'].lineData[645] = 0;
  _$jscoverage['/control.js'].lineData[794] = 0;
  _$jscoverage['/control.js'].lineData[795] = 0;
  _$jscoverage['/control.js'].lineData[797] = 0;
  _$jscoverage['/control.js'].lineData[798] = 0;
  _$jscoverage['/control.js'].lineData[834] = 0;
  _$jscoverage['/control.js'].lineData[840] = 0;
  _$jscoverage['/control.js'].lineData[841] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[845] = 0;
  _$jscoverage['/control.js'].lineData[847] = 0;
  _$jscoverage['/control.js'].lineData[850] = 0;
  _$jscoverage['/control.js'].lineData[871] = 0;
  _$jscoverage['/control.js'].lineData[873] = 0;
  _$jscoverage['/control.js'].lineData[880] = 0;
  _$jscoverage['/control.js'].lineData[881] = 0;
  _$jscoverage['/control.js'].lineData[884] = 0;
  _$jscoverage['/control.js'].lineData[886] = 0;
  _$jscoverage['/control.js'].lineData[887] = 0;
  _$jscoverage['/control.js'].lineData[890] = 0;
  _$jscoverage['/control.js'].lineData[891] = 0;
  _$jscoverage['/control.js'].lineData[893] = 0;
  _$jscoverage['/control.js'].lineData[896] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['48'] = [];
  _$jscoverage['/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['57'] = [];
  _$jscoverage['/control.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['77'] = [];
  _$jscoverage['/control.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['85'] = [];
  _$jscoverage['/control.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['96'] = [];
  _$jscoverage['/control.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['102'] = [];
  _$jscoverage['/control.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['118'] = [];
  _$jscoverage['/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['123'] = [];
  _$jscoverage['/control.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['128'] = [];
  _$jscoverage['/control.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['173'] = [];
  _$jscoverage['/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['179'] = [];
  _$jscoverage['/control.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['192'] = [];
  _$jscoverage['/control.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['209'] = [];
  _$jscoverage['/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['224'] = [];
  _$jscoverage['/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['241'] = [];
  _$jscoverage['/control.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['257'] = [];
  _$jscoverage['/control.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['258'] = [];
  _$jscoverage['/control.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['259'] = [];
  _$jscoverage['/control.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['262'] = [];
  _$jscoverage['/control.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'] = [];
  _$jscoverage['/control.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['265'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['269'] = [];
  _$jscoverage['/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['271'] = [];
  _$jscoverage['/control.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['271'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['271'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['271'][4] = new BranchData();
  _$jscoverage['/control.js'].branchData['271'][5] = new BranchData();
  _$jscoverage['/control.js'].branchData['279'] = [];
  _$jscoverage['/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['294'] = [];
  _$jscoverage['/control.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['294'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['300'] = [];
  _$jscoverage['/control.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['313'] = [];
  _$jscoverage['/control.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['328'] = [];
  _$jscoverage['/control.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['344'] = [];
  _$jscoverage['/control.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['357'] = [];
  _$jscoverage['/control.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['364'] = [];
  _$jscoverage['/control.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['376'] = [];
  _$jscoverage['/control.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['388'] = [];
  _$jscoverage['/control.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['390'] = [];
  _$jscoverage['/control.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['466'] = [];
  _$jscoverage['/control.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['469'] = [];
  _$jscoverage['/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['567'] = [];
  _$jscoverage['/control.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['568'] = [];
  _$jscoverage['/control.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['571'] = [];
  _$jscoverage['/control.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['766'] = [];
  _$jscoverage['/control.js'].branchData['766'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['797'] = [];
  _$jscoverage['/control.js'].branchData['797'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['846'] = [];
  _$jscoverage['/control.js'].branchData['846'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['886'] = [];
  _$jscoverage['/control.js'].branchData['886'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['886'][1].init(384, 6, 'xclass');
function visit102_886_1(result) {
  _$jscoverage['/control.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['846'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_846_1(result) {
  _$jscoverage['/control.js'].branchData['846'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['797'][1].init(167, 1, 'p');
function visit100_797_1(result) {
  _$jscoverage['/control.js'].branchData['797'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['766'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit99_766_1(result) {
  _$jscoverage['/control.js'].branchData['766'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['571'][1].init(172, 19, 'xy[1] !== undefined');
function visit98_571_1(result) {
  _$jscoverage['/control.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['568'][1].init(33, 19, 'xy[0] !== undefined');
function visit97_568_1(result) {
  _$jscoverage['/control.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['567'][1].init(119, 9, 'xy.length');
function visit96_567_1(result) {
  _$jscoverage['/control.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['469'][1].init(159, 7, 'v || []');
function visit95_469_1(result) {
  _$jscoverage['/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['466'][1].init(29, 21, 'typeof v === \'string\'');
function visit94_466_1(result) {
  _$jscoverage['/control.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['390'][1].init(241, 19, 'self.get(\'srcNode\')');
function visit93_390_1(result) {
  _$jscoverage['/control.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['388'][1].init(159, 9, 'self.view');
function visit92_388_1(result) {
  _$jscoverage['/control.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['376'][1].init(99, 21, 'self.get(\'focusable\')');
function visit91_376_1(result) {
  _$jscoverage['/control.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['364'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_364_1(result) {
  _$jscoverage['/control.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['357'][1].init(21, 33, 'ev.keyCode === Node.KeyCode.ENTER');
function visit89_357_1(result) {
  _$jscoverage['/control.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['344'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit88_344_1(result) {
  _$jscoverage['/control.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['328'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_328_1(result) {
  _$jscoverage['/control.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['313'][1].init(21, 21, '!this.get(\'disabled\')');
function visit86_313_1(result) {
  _$jscoverage['/control.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['300'][1].init(21, 21, '!this.get(\'disabled\')');
function visit85_300_1(result) {
  _$jscoverage['/control.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['294'][3].init(99, 14, 'ev.which === 1');
function visit84_294_3(result) {
  _$jscoverage['/control.js'].branchData['294'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['294'][2].init(99, 41, 'ev.which === 1 || isTouchGestureSupported');
function visit83_294_2(result) {
  _$jscoverage['/control.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['294'][1].init(76, 65, 'self.get(\'active\') && (ev.which === 1 || isTouchGestureSupported)');
function visit82_294_1(result) {
  _$jscoverage['/control.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['279'][1].init(21, 21, '!this.get(\'disabled\')');
function visit81_279_1(result) {
  _$jscoverage['/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['271'][5].init(354, 14, 'n !== \'button\'');
function visit80_271_5(result) {
  _$jscoverage['/control.js'].branchData['271'][5].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['271'][4].init(334, 16, 'n !== \'textarea\'');
function visit79_271_4(result) {
  _$jscoverage['/control.js'].branchData['271'][4].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['271'][3].init(334, 34, 'n !== \'textarea\' && n !== \'button\'');
function visit78_271_3(result) {
  _$jscoverage['/control.js'].branchData['271'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['271'][2].init(317, 13, 'n !== \'input\'');
function visit77_271_2(result) {
  _$jscoverage['/control.js'].branchData['271'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['271'][1].init(317, 51, 'n !== \'input\' && n !== \'textarea\' && n !== \'button\'');
function visit76_271_1(result) {
  _$jscoverage['/control.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['269'][1].init(188, 20, 'n && n.toLowerCase()');
function visit75_269_1(result) {
  _$jscoverage['/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][2].init(291, 59, 'ev.originalEvent.type.toLowerCase().indexOf(\'mouse\') !== -1');
function visit74_265_2(result) {
  _$jscoverage['/control.js'].branchData['265'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['265'][1].init(256, 94, '!self.get(\'allowTextSelection\') && ev.originalEvent.type.toLowerCase().indexOf(\'mouse\') !== -1');
function visit73_265_1(result) {
  _$jscoverage['/control.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['262'][1].init(147, 21, 'self.get(\'focusable\')');
function visit72_262_1(result) {
  _$jscoverage['/control.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['259'][1].init(25, 22, 'self.get(\'activeable\')');
function visit71_259_1(result) {
  _$jscoverage['/control.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['258'][1].init(135, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit70_258_1(result) {
  _$jscoverage['/control.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['257'][1].init(81, 14, 'ev.which === 1');
function visit69_257_1(result) {
  _$jscoverage['/control.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['241'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_241_1(result) {
  _$jscoverage['/control.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['224'][1].init(21, 21, '!this.get(\'disabled\')');
function visit67_224_1(result) {
  _$jscoverage['/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['209'][1].init(21, 21, '!this.get(\'disabled\')');
function visit66_209_1(result) {
  _$jscoverage['/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['192'][1].init(21, 21, '!this.get(\'disabled\')');
function visit65_192_1(result) {
  _$jscoverage['/control.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['179'][1].init(21, 21, 'this.get(\'focusable\')');
function visit64_179_1(result) {
  _$jscoverage['/control.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['173'][1].init(21, 21, 'this.get(\'focusable\')');
function visit63_173_1(result) {
  _$jscoverage['/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['128'][1].init(183, 45, 'target.ownerDocument.activeElement === target');
function visit62_128_1(result) {
  _$jscoverage['/control.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['123'][1].init(84, 1, 'v');
function visit61_123_1(result) {
  _$jscoverage['/control.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['118'][1].init(53, 14, 'parent || this');
function visit60_118_1(result) {
  _$jscoverage['/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['102'][1].init(798, 6, 'ie < 9');
function visit59_102_1(result) {
  _$jscoverage['/control.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['96'][1].init(532, 14, 'Gesture.cancel');
function visit58_96_1(result) {
  _$jscoverage['/control.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['85'][1].init(480, 29, 'self.get(\'handleMouseEvents\')');
function visit57_85_1(result) {
  _$jscoverage['/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['77'][1].init(111, 21, 'self.get(\'focusable\')');
function visit56_77_1(result) {
  _$jscoverage['/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['57'][1].init(623, 31, '!self.get(\'allowTextSelection\')');
function visit55_57_1(result) {
  _$jscoverage['/control.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['48'][1].init(295, 4, 'view');
function visit54_48_1(result) {
  _$jscoverage['/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ComponentProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchGestureSupported = Features.isTouchGestureSupported();
  _$jscoverage['/control.js'].lineData[21]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[41]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get('id'), el;
  _$jscoverage['/control.js'].lineData[48]++;
  if (visit54_48_1(view)) {
    _$jscoverage['/control.js'].lineData[49]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[51]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[55]++;
  view.create();
  _$jscoverage['/control.js'].lineData[56]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[57]++;
  if (visit55_57_1(!self.get('allowTextSelection'))) {
    _$jscoverage['/control.js'].lineData[58]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[61]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[70]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[74]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[77]++;
  if (visit56_77_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[82]++;
    el.on('focus', self.handleFocus, self).on('blur', self.handleBlur, self).on('keydown', self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[85]++;
  if (visit57_85_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[86]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[90]++;
    el.on('mouseenter', self.handleMouseEnter, self).on('mouseleave', self.handleMouseLeave, self).on('contextmenu', self.handleContextMenu, self);
    _$jscoverage['/control.js'].lineData[95]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[96]++;
    if (visit58_96_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[97]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[102]++;
    if (visit59_102_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[103]++;
      el.on('dblclick', self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[109]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[110]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[111]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[112]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[113]++;
  self.__callPluginsMethod('pluginSyncUI');
  _$jscoverage['/control.js'].lineData[114]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[118]++;
  return Manager.createComponent(cfg, visit60_118_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[122]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[123]++;
  if (visit61_123_1(v)) {
    _$jscoverage['/control.js'].lineData[124]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[128]++;
    if (visit62_128_1(target.ownerDocument.activeElement === target)) {
      _$jscoverage['/control.js'].lineData[129]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[135]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[141]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[148]++;
  this.fire(v ? 'show' : 'hide');
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[157]++;
  self.render();
  _$jscoverage['/control.js'].lineData[158]++;
  self.set('visible', true);
  _$jscoverage['/control.js'].lineData[159]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[168]++;
  self.set('visible', false);
  _$jscoverage['/control.js'].lineData[169]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[173]++;
  if (visit63_173_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[174]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[179]++;
  if (visit64_179_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[180]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[185]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[192]++;
  if (visit65_192_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[193]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[205]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[209]++;
  if (visit66_209_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[210]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[220]++;
  this.set('highlighted', !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[224]++;
  if (visit67_224_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[225]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[235]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[236]++;
  self.set('active', false);
  _$jscoverage['/control.js'].lineData[237]++;
  self.set('highlighted', !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[241]++;
  if (visit68_241_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[242]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[255]++;
  var self = this, n, isMouseActionButton = visit69_257_1(ev.which === 1);
  _$jscoverage['/control.js'].lineData[258]++;
  if (visit70_258_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[259]++;
    if (visit71_259_1(self.get('activeable'))) {
      _$jscoverage['/control.js'].lineData[260]++;
      self.set('active', true);
    }
    _$jscoverage['/control.js'].lineData[262]++;
    if (visit72_262_1(self.get('focusable'))) {
      _$jscoverage['/control.js'].lineData[263]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[265]++;
    if (visit73_265_1(!self.get('allowTextSelection') && visit74_265_2(ev.originalEvent.type.toLowerCase().indexOf('mouse') !== -1))) {
      _$jscoverage['/control.js'].lineData[268]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[269]++;
      n = visit75_269_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[271]++;
      if (visit76_271_1(visit77_271_2(n !== 'input') && visit78_271_3(visit79_271_4(n !== 'textarea') && visit80_271_5(n !== 'button')))) {
        _$jscoverage['/control.js'].lineData[272]++;
        ev.preventDefault();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[279]++;
  if (visit81_279_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[280]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[292]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[294]++;
  if (visit82_294_1(self.get('active') && (visit83_294_2(visit84_294_3(ev.which === 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[295]++;
    self.set('active', false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[300]++;
  if (visit85_300_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[301]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function() {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[313]++;
  if (visit86_313_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[314]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[323]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[324]++;
  this.fire('focus');
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[328]++;
  if (visit87_328_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[329]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[338]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[339]++;
  this.fire('blur');
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[343]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[344]++;
  if (visit88_344_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[345]++;
    ev.halt();
    _$jscoverage['/control.js'].lineData[346]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[348]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[357]++;
  if (visit89_357_1(ev.keyCode === Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[358]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[360]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[364]++;
  if (visit90_364_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[365]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[375]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[376]++;
  if (visit91_376_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[377]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[385]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[387]++;
  Manager.removeComponent(self.get('id'));
  _$jscoverage['/control.js'].lineData[388]++;
  if (visit92_388_1(self.view)) {
    _$jscoverage['/control.js'].lineData[389]++;
    self.view.destroy();
  } else {
    _$jscoverage['/control.js'].lineData[390]++;
    if (visit93_390_1(self.get('srcNode'))) {
      _$jscoverage['/control.js'].lineData[391]++;
      self.get('srcNode').remove();
    }
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[402]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[466]++;
  if (visit94_466_1(typeof v === 'string')) {
    _$jscoverage['/control.js'].lineData[467]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[469]++;
  return visit95_469_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[519]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[520]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[565]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[567]++;
  if (visit96_567_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[568]++;
    if (visit97_568_1(xy[0] !== undefined)) {
      _$jscoverage['/control.js'].lineData[569]++;
      self.set('x', xy[0]);
    }
    _$jscoverage['/control.js'].lineData[571]++;
    if (visit98_571_1(xy[1] !== undefined)) {
      _$jscoverage['/control.js'].lineData[572]++;
      self.set('y', xy[1]);
    }
  }
  _$jscoverage['/control.js'].lineData[575]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[578]++;
  return [this.get('x'), this.get('y')];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[645]++;
  return Node.all(v);
}}, 
  handleMouseEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit99_766_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[794]++;
  if ((prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[795]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[797]++;
  if (visit100_797_1(p)) {
    _$jscoverage['/control.js'].lineData[798]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[834]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[840]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[841]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[843]++;
    do {
      _$jscoverage['/control.js'].lineData[844]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[845]++;
      constructor = constructor.superclass;
    } while (visit101_846_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[847]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[850]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[871]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[873]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[880]++;
  if ((xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[881]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[884]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[886]++;
  if (visit102_886_1(xclass)) {
    _$jscoverage['/control.js'].lineData[887]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[890]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[891]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[893]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[896]++;
  return Control;
});
