/**
 * copied from https://github.com/TeamSQL/SQL-Statement-Parser/blob/master/src/index.ts
 * minor improvements
 */

class QueryParser {
  static parse(query: string): Array<string> {
    const delimiter = ";";
    const queries: Array<string> = [];
    const flag = true;
    let restOfQuery: string;
    while (flag) {
      if (restOfQuery == null) {
        restOfQuery = query;
      }
      const statementAndRest = QueryParser.getStatements(
        restOfQuery,
        delimiter
      );

      const statement = statementAndRest[0];
      if (statement != null && statement.trim() != "") {
        queries.push(statement);
      }

      restOfQuery = statementAndRest[1];
      if (restOfQuery == null || restOfQuery.trim() == "") {
        break;
      }
    }

    return queries;
  }

  static getStatements(query: string, delimiter: string): Array<string> {
    const charArray: Array<string> = Array.from(query);
    let previousChar: string = null;
    let nextChar: string = null;
    let isInComment = false;
    let commentChar: string = null;
    let isInString = false;
    let stringChar: string = null;
    let isInTag = false;
    let tagChar: string = null;

    let resultQueries: Array<string> = [];
    for (let index = 0; index < charArray.length; index++) {
      const char = charArray[index];
      if (index > 0) {
        previousChar = charArray[index - 1];
      }

      if (index < charArray.length) {
        nextChar = charArray[index + 1];
      }

      // it's in string, go to next char
      if (
        previousChar != "\\" &&
        (char == "'" || char == '"') &&
        isInString == false &&
        isInComment == false
      ) {
        isInString = true;
        stringChar = char;
        continue;
      }

      // it's comment, go to next char
      if (
        ((char == "#" && nextChar == " ") ||
          (char == "-" && nextChar == "-") ||
          (char == "/" && nextChar == "*")) &&
        isInString == false
      ) {
        isInComment = true;
        commentChar = char;
        continue;
      }
      // it's end of comment, go to next
      if (
        isInComment == true &&
        (((commentChar == "#" || commentChar == "-") && char == "\n") ||
          (commentChar == "/" && char == "*" && nextChar == "/"))
      ) {
        isInComment = false;
        commentChar = null;
        continue;
      }

      // string closed, go to next char
      if (previousChar != "\\" && char == stringChar && isInString == true) {
        isInString = false;
        stringChar = null;
        continue;
      }

      if (char == "$" && isInComment == false && isInString == false) {
        const queryUntilTagSymbol = query.substring(index);
        if (isInTag == false) {
          const tagSymbolResult = QueryParser.getTag(queryUntilTagSymbol);
          if (tagSymbolResult != null) {
            isInTag = true;
            tagChar = tagSymbolResult[0];
          }
        } else {
          const tagSymbolResult = QueryParser.getTag(queryUntilTagSymbol);
          if (tagSymbolResult != null) {
            const tagSymbol = tagSymbolResult[0];
            if (tagSymbol == tagChar) {
              isInTag = false;
            }
          }
        }
      }

      // it's a query, continue until you get delimiter hit
      if (
        (char.toLowerCase() === delimiter.toLowerCase() ||
          char.toLowerCase() === "go") &&
        isInString == false &&
        isInComment == false &&
        isInTag == false
      ) {
        const splittingIndex = index + 1;
        resultQueries = QueryParser.getQueryParts(query, splittingIndex, 0);
        break;
      }
    }
    if (resultQueries.length == 0) {
      if (query != null) {
        query = query.trim();
      }
      resultQueries.push(query, null);
    }

    return resultQueries;
  }

  static getQueryParts(
    query: string,
    splittingIndex: number,
    numChars = 1
  ): Array<string> {
    let statement: string = query.substring(0, splittingIndex);
    const restOfQuery: string = query.substring(splittingIndex + numChars);
    const result: Array<string> = [];
    if (statement != null) {
      statement = statement.trim();
    }
    result.push(statement);
    result.push(restOfQuery);
    return result;
  }

  static getTag(query: string): Array<any> {
    const matchTag = query.match(/^(\$[a-zA-Z]*\$)/i);
    if (matchTag != null && matchTag.length > 1) {
      const result: Array<any> = [];
      const tagSymbol = matchTag[1].trim();
      const indexOfCmd = query.indexOf(tagSymbol);
      result.push(tagSymbol);
      result.push(indexOfCmd);
      return result;
    } else {
      return null;
    }
  }
}

export default QueryParser.parse;
