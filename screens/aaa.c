#include <stdio.h>
#include <string.h>
#include <stdlib.h>
char input[100];
int pos = 0;
void E();
void E_prime();
void match(char token)
{
    if (input[pos] == token)
    {
        pos++;
    }
    else
    {
        printf("Syntax Error\n");
        exit(1);
    }
}
void E_prime()
{
    if (input[pos] == '+')
    {
        match('+');
        match('i');

        E_prime();
    }
    if (input[pos] == '*')
    {
        match('*');
        match('i');
        E_prime();
    }
    // E' -> ε}
}
void E()
{
    match('i');
    E_prime();
}

int main()
{
    printf("Grammer without left recursion\n");
    printf("E->iE'\n");
    printf("E'->+iE'|e|*iE'\n");

    printf("Enter an expression: ");
    scanf("%s", input);

    E(); // Start the parsing from the non-terminal E

    if (input[pos] == '\0')
    {

        printf("Parsing Successful: Valid Expression\n");
    }
    else
    {
        printf("Syntax Error\n");
    }

    return 0;
}

/*OUTPUT:

Grammer without left recursion
E->iE'
E'->+iE'|e|*iE'
Enter an expression: i+i*i+i
Parsing Successful: Valid Expression
*/